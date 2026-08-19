import { useEffect, type RefObject } from 'react'
import * as THREE from 'three'

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** Scroll velocity (px/ms) adds temporary spin; matches PrivacySphere. */
const SCROLL_VELOCITY_GAIN = 0.45
const SCROLL_SPIN_MAX_BOOST = 4
/** Per-frame decay at 60fps; applied with Math.pow(..., dt*60). */
const SCROLL_SPIN_DECAY_PER_FRAME_60 = 0.92

/**
 * Sparse outer particle shell around the Armada mark.
 */
const SHELL_RADIUS = 3.2
const SHELL_COUNT = 620
/** EXCEPTION — particle size in world units (marketing denseness). */
const SHELL_POINT_SIZE = 0.14
const SHELL_SPIN = -0.0028
/** Slow drift of the gem band around the shell (when gradient is active). */
const SHELL_GRADIENT_DRIFT = 0.004
/**
 * Pointer proximity: shell contracts toward the mark (protect).
 * 1 = idle radius; lower = tighter around the core.
 */
const SHELL_SCALE_IDLE = 1
const SHELL_SCALE_PROTECT = 0.68
/** How quickly scale / gradient eases toward the pointer target (per 60fps frame). */
const SHELL_PROTECT_LERP = 0.1
/** Screen distance (0 at center → 1 at panel edge) where protect fades out. */
const SHELL_PROTECT_RADIUS = 0.85

/**
 * Matches Three.js PointsMaterial sizeAttenuation:
 * gl_PointSize = size * ((canvasHeight * 0.5) / -mvPosition.z)
 */
function pointScaleFromHeight(cssHeight: number): number {
  return cssHeight * 0.5
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

const CAMERA_Z = 8.0
const CAMERA_FOV = 45
const STAGE_SCALE = 0.62

type Rgb = { r: number; g: number; b: number }

function readCssColor(varName: string, scope?: HTMLElement): Rgb {
  const probe = document.createElement('div')
  probe.style.color = `var(${varName})`
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  const host = scope ?? document.body
  host.appendChild(probe)
  const raw = getComputedStyle(probe).color
  host.removeChild(probe)
  const match = raw.match(/[\d.]+/g)
  if (!match || match.length < 3) return { r: 162, g: 162, b: 162 }
  return {
    r: Number(match[0]),
    g: Number(match[1]),
    b: Number(match[2]),
  }
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  }
}

function sampleGem(t: number, lavender: Rgb, rose: Rgb, amber: Rgb): Rgb {
  const u = ((t % 1) + 1) % 1
  if (u < 0.52) return mixRgb(lavender, rose, u / 0.52)
  return mixRgb(rose, amber, (u - 0.52) / 0.48)
}

/** Soft white disc — tinted per-particle via vertex colors. Keep edge fairly hard so dots stay crisp. */
function createParticleDiscTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.clearRect(0, 0, size, size)
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.42)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.55, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.82, 'rgba(255,255,255,0.35)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/** Even fibonacci lattice on a sphere surface (no radial jitter). */
function fibonacciShell(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = GOLDEN_ANGLE * i
    const idx = i * 3
    positions[idx] = Math.cos(theta) * radiusAtY * radius
    positions[idx + 1] = y * radius
    positions[idx + 2] = Math.sin(theta) * radiusAtY * radius
  }
  return positions
}

/**
 * Sparse gem-gradient particle shell (lavender → rose → amber).
 * Pointer proximity still contracts the shell around the mark.
 */
function createGemParticleShell(
  lavender: Rgb,
  rose: Rgb,
  amber: Rgb,
  coreRadiusWorld: number,
): {
  points: THREE.Points
  geometry: THREE.BufferGeometry
  material: THREE.ShaderMaterial
  texture: THREE.CanvasTexture
  colorAttr: THREE.BufferAttribute
  baseLongitudes: Float32Array
} {
  const positions = fibonacciShell(SHELL_COUNT, SHELL_RADIUS)
  const colors = new Float32Array(SHELL_COUNT * 3)
  const baseLongitudes = new Float32Array(SHELL_COUNT)

  for (let i = 0; i < SHELL_COUNT; i += 1) {
    const x = positions[i * 3]!
    const y = positions[i * 3 + 1]!
    const z = positions[i * 3 + 2]!
    const lon = Math.atan2(z, x) / (Math.PI * 2) + 0.5
    const latBias = (y / SHELL_RADIUS) * 0.18
    baseLongitudes[i] = lon + latBias
    const c = sampleGem(lon + latBias, lavender, rose, amber)
    colors[i * 3] = c.r / 255
    colors[i * 3 + 1] = c.g / 255
    colors[i * 3 + 2] = c.b / 255
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const colorAttr = new THREE.BufferAttribute(colors, 3)
  geometry.setAttribute('color', colorAttr)

  const texture = createParticleDiscTexture()
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uSize: { value: SHELL_POINT_SIZE },
      uScale: { value: pointScaleFromHeight(500) },
      uOpacity: { value: 0.92 },
      uGlobeRadius: { value: coreRadiusWorld },
    },
    vertexShader: `
      attribute vec3 color;
      varying vec3 vColor;
      varying float vHidden;
      uniform float uSize;
      uniform float uScale;
      uniform float uGlobeRadius;

      void main() {
        vColor = color;
        vec4 worldPos4 = modelMatrix * vec4(position, 1.0);
        vec3 worldPos = worldPos4.xyz;
        vec3 cam = cameraPosition;
        vec3 toParticle = worldPos - cam;
        float dist = length(toParticle);
        vec3 rayDir = toParticle / max(dist, 0.0001);

        float b = dot(cam, rayDir);
        float c = dot(cam, cam) - uGlobeRadius * uGlobeRadius;
        float disc = b * b - c;
        vHidden = 0.0;
        if (disc > 0.0) {
          float tHit = -b - sqrt(disc);
          if (tHit > 0.0 && tHit < dist - 0.04) {
            vHidden = 1.0;
          }
        }

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize * (uScale / max(0.001, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vHidden;

      void main() {
        if (vHidden > 0.5) discard;
        vec4 tex = texture2D(uMap, gl_PointCoord);
        if (tex.a < 0.2) discard;
        gl_FragColor = vec4(vColor, tex.a * uOpacity);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
  })

  const points = new THREE.Points(geometry, material)
  return { points, geometry, material, texture, colorAttr, baseLongitudes }
}

function paintShellColors(
  colorAttr: THREE.BufferAttribute,
  baseLongitudes: Float32Array,
  phase: number,
  lavender: Rgb,
  rose: Rgb,
  amber: Rgb,
) {
  const colors = colorAttr.array as Float32Array
  for (let i = 0; i < baseLongitudes.length; i += 1) {
    const c = sampleGem(baseLongitudes[i]! + phase, lavender, rose, amber)
    colors[i * 3] = c.r / 255
    colors[i * 3 + 1] = c.g / 255
    colors[i * 3 + 2] = c.b / 255
  }
  colorAttr.needsUpdate = true
}

/**
 * Beyond-capture diagram: Armada mark (HTML overlay) + gem-gradient particle shell.
 */
export function useBeyondCaptureScene(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const lavenderRgb = readCssColor('--semantic-color-brand-lavender', container)
    const roseRgb = readCssColor('--semantic-color-brand-gradient-rose', container)
    const amberRgb = readCssColor('--semantic-color-brand-amber', container)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100)
    camera.position.set(0, 0, CAMERA_Z)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const stage = new THREE.Group()
    stage.scale.setScalar(STAGE_SCALE)
    scene.add(stage)

    const shellGroup = new THREE.Group()
    stage.add(shellGroup)
    /** Soft core volume so particles don’t draw through the mark. */
    const markCoreRadius = 1.15 * STAGE_SCALE
    const shell = createGemParticleShell(lavenderRgb, roseRgb, amberRgb, markCoreRadius)
    shellGroup.add(shell.points)

    let disposed = false
    let frameId = 0
    let lastFrameTs = performance.now()
    let scrollBoost = 0
    let lastScrollY = window.scrollY
    let lastScrollTs = performance.now()
    let gradientPhase = 0
    let shellScale = SHELL_SCALE_IDLE
    let shellScaleTarget = SHELL_SCALE_IDLE

    const updateProtectTarget = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return
      const nx = (clientX - rect.left) / rect.width - 0.5
      const ny = (clientY - rect.top) / rect.height - 0.5
      const dist = clamp01((Math.hypot(nx, ny) * 2) / SHELL_PROTECT_RADIUS)
      const protect = (1 - dist) * (1 - dist)
      shellScaleTarget = THREE.MathUtils.lerp(SHELL_SCALE_IDLE, SHELL_SCALE_PROTECT, protect)
    }

    const onPointerMove = (event: PointerEvent) => {
      updateProtectTarget(event.clientX, event.clientY)
    }

    const onPointerEnter = (event: PointerEvent) => {
      updateProtectTarget(event.clientX, event.clientY)
    }

    const onPointerLeave = () => {
      shellScaleTarget = SHELL_SCALE_IDLE
    }

    const root = container.parentElement ?? container
    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerenter', onPointerEnter)
    root.addEventListener('pointerleave', onPointerLeave)

    const onScroll = () => {
      if (disposed || reducedMotion.matches) return
      const now = performance.now()
      const y = window.scrollY
      const dy = Math.abs(y - lastScrollY)
      const dt = Math.max(now - lastScrollTs, 1)
      lastScrollY = y
      lastScrollTs = now

      const velocityPxPerMs = dy / dt
      scrollBoost = Math.min(
        SCROLL_SPIN_MAX_BOOST,
        scrollBoost + velocityPxPerMs * SCROLL_VELOCITY_GAIN,
      )
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      shell.material.uniforms.uScale!.value = pointScaleFromHeight(height)
    }

    const observer = new ResizeObserver(() => resize())
    observer.observe(container)
    resize()

    const renderFrame = () => {
      renderer.render(scene, camera)
    }

    const tick = (now: number) => {
      if (disposed) return
      const dtSec = Math.min(Math.max((now - lastFrameTs) / 1000, 0), 0.064)
      lastFrameTs = now
      const frameScale = dtSec * 60

      const protectLerp = reducedMotion.matches
        ? 1
        : 1 - Math.pow(1 - SHELL_PROTECT_LERP, frameScale)
      shellScale += (shellScaleTarget - shellScale) * protectLerp
      shellGroup.scale.setScalar(shellScale)

      if (!reducedMotion.matches) {
        scrollBoost *= Math.pow(SCROLL_SPIN_DECAY_PER_FRAME_60, dtSec * 60)
        if (scrollBoost < 0.02) scrollBoost = 0
        const spinMul = 1 + scrollBoost
        shellGroup.rotation.y += SHELL_SPIN * spinMul * frameScale
        gradientPhase += SHELL_GRADIENT_DRIFT * frameScale
      }

      paintShellColors(
        shell.colorAttr,
        shell.baseLongitudes,
        gradientPhase,
        lavenderRgb,
        roseRgb,
        amberRgb,
      )

      renderFrame()
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        scrollBoost = 0
      }
    }
    reducedMotion.addEventListener('change', onMotionChange)

    return () => {
      disposed = true
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerenter', onPointerEnter)
      root.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('scroll', onScroll)
      reducedMotion.removeEventListener('change', onMotionChange)
      window.cancelAnimationFrame(frameId)
      observer.disconnect()

      shell.geometry.dispose()
      shell.material.dispose()
      shell.texture.dispose()

      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [containerRef])
}
