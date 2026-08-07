import { useEffect, type RefObject } from 'react'
import * as THREE from 'three'
/** Ink disk + Heroicons 24/outline EyeIcon (see asset comment). */
import eyeBadgeUrl from '@/assets/privacy-eye-badge.svg'

const SPHERE_RADIUS = 2.4
const DEPTH_SPHERE_RADIUS = 2.38
const MERIDIAN_COUNT = 7
const MERIDIAN_OPACITY = 1
/** Skip this many radians at each pole so meridians don't hook into the wrap-around. */
const MERIDIAN_POLE_CUT = 0.38
const SPHERE_SPIN = 0.0048

const CLUSTER_COUNT = 12
const CLUSTER_RADIUS = 1.4
const CLUSTER_SPIN = 0.0064
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const BLUR_PX = 8.4

/** Scroll velocity (px/ms) adds temporary spin; decays each frame back to idle. */
const SCROLL_VELOCITY_GAIN = 0.45
const SCROLL_SPIN_MAX_BOOST = 4
/** Per-frame decay at 60fps; applied with Math.pow(..., dt*60). */
const SCROLL_SPIN_DECAY_PER_FRAME_60 = 0.92

/** Two eye badges on one shared diagonal ring (opposite sides). */
const ORBIT_COUNT = 2
/** Outside the wireframe so badges read as orbiting clear of the sphere. */
const ORBIT_RADIUS = 2.9
const ORBIT_BASE_SPEED = 0.009
/** Tilt of the orbit plane around Z — ~45° reads bottom-left ↔ top-right (ref). */
const ORBIT_TILT = Math.PI / 4
const ORBIT_TILT_COS = Math.cos(ORBIT_TILT)
const ORBIT_TILT_SIN = Math.sin(ORBIT_TILT)
/** Max on-screen size when a badge is at the front of the orbit (--primitives-spacing-16). */
const ORBIT_FRONT_PX = 64

/* Camera distance tuned for the wider stage (badges at ORBIT_RADIUS clear the edges). */
const CAMERA_Z = 8.0
const CAMERA_FOV = 45

/** World-unit sprite scale so a front-orbit badge reads as `ORBIT_FRONT_PX` tall. */
function orbitWorldScale(canvasHeight: number): number {
  const fovRad = (CAMERA_FOV * Math.PI) / 180
  const distToFront = CAMERA_Z - ORBIT_RADIUS
  const visibleHeight = 2 * Math.tan(fovRad / 2) * distToFront
  return (ORBIT_FRONT_PX / Math.max(1, canvasHeight)) * visibleHeight
}

/** Point on the diagonal orbit: circle in XZ, then rotate around Z by ORBIT_TILT. */
function diagonalOrbitPosition(angle: number, target: THREE.Vector3) {
  const along = Math.cos(angle) * ORBIT_RADIUS
  const depth = Math.sin(angle) * ORBIT_RADIUS
  return target.set(along * ORBIT_TILT_COS, along * ORBIT_TILT_SIN, depth)
}

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

function rgbToHex({ r, g, b }: Rgb): number {
  return (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  }
}

function createBlurDotTexture(color: Rgb): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.clearRect(0, 0, size, size)
  ctx.filter = `blur(${BLUR_PX}px)`
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.38)
  gradient.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0.95)`)
  gradient.addColorStop(0.55, `rgba(${color.r},${color.g},${color.b},0.45)`)
  gradient.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`)
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2)
  ctx.fill()
  ctx.filter = 'none'

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/** Fallback if the Heroicons-based SVG fails to load. */
function createEyeBadgeFallback(ink: Rgb): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = `rgb(${ink.r},${ink.g},${ink.b})`
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2)
  ctx.fill()
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function loadEyeBadgeTexture(ink: Rgb): Promise<THREE.Texture> {
  return new Promise((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      const size = 256
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(createEyeBadgeFallback(ink))
        return
      }
      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(image, 0, 0, size, size)
      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      resolve(texture)
    }
    image.onerror = () => {
      resolve(createEyeBadgeFallback(ink))
    }
    image.src = eyeBadgeUrl
  })
}

function fibonacciPoints(count: number, radius: number, rand: () => number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = GOLDEN_ANGLE * i
    const pull = 0.55 + Math.cbrt(rand()) * 0.45
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * radiusAtY * radius * pull,
        y * radius * pull,
        Math.sin(theta) * radiusAtY * radius * pull,
      ),
    )
  }
  return points
}

function meridianPoint(radius: number, longitude: number, phi: number, target: THREE.Vector3) {
  return target.set(
    radius * Math.sin(phi) * Math.cos(longitude),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(longitude),
  )
}

/** Open arc along a meridian — does not include the poles. */
function createMeridianArcGeometry(
  radius: number,
  longitude: number,
  phiStart: number,
  phiEnd: number,
  segments = 64,
): THREE.BufferGeometry {
  const positions = new Float32Array((segments + 1) * 3)
  const point = new THREE.Vector3()
  for (let i = 0; i <= segments; i += 1) {
    const phi = phiStart + ((phiEnd - phiStart) * i) / segments
    meridianPoint(radius, longitude, phi, point)
    const idx = i * 3
    positions[idx] = point.x
    positions[idx + 1] = point.y
    positions[idx + 2] = point.z
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

/**
 * True perspective silhouette of a sphere at the origin, camera on +Z.
 * A unit circle in the equatorial plane looks oversized under perspective.
 */
function createOutlineCircleGeometry(
  sphereRadius: number,
  cameraZ: number,
  segments = 128,
): THREE.BufferGeometry {
  const silhouetteZ = (sphereRadius * sphereRadius) / cameraZ
  const silhouetteRadius =
    sphereRadius * Math.sqrt(1 - (sphereRadius * sphereRadius) / (cameraZ * cameraZ))
  const positions = new Float32Array(segments * 3)
  for (let i = 0; i < segments; i += 1) {
    const theta = (i / segments) * Math.PI * 2
    const idx = i * 3
    positions[idx] = Math.cos(theta) * silhouetteRadius
    positions[idx + 1] = Math.sin(theta) * silhouetteRadius
    positions[idx + 2] = silhouetteZ
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function useThreeScene(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const rand = mulberry32(42)

    const borderRgb = readCssColor('--privacy-sphere-stroke', container)
    const inkRgb = readCssColor('--semantic-color-brand-ink')
    const infoRgb = readCssColor('--semantic-color-status-info')
    const lavenderRgb = readCssColor('--semantic-color-brand-lavender')
    const actionRgb = readCssColor('--semantic-color-brand-action')

    const blueRamp: Rgb[] = [
      mixRgb(infoRgb, { r: 255, g: 255, b: 255 }, 0.45),
      mixRgb(infoRgb, lavenderRgb, 0.25),
      infoRgb,
      mixRgb(infoRgb, actionRgb, 0.45),
      mixRgb(actionRgb, { r: 10, g: 20, b: 60 }, 0.35),
    ]

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100)
    camera.position.set(0, 0, CAMERA_Z)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const sphereGroup = new THREE.Group()
    scene.add(sphereGroup)

    const meridianMaterial = new THREE.LineBasicMaterial({
      color: rgbToHex(borderRgb),
      transparent: true,
      opacity: MERIDIAN_OPACITY,
    })
    const meridianGeometries: THREE.BufferGeometry[] = []
    const cut = MERIDIAN_POLE_CUT
    for (let i = 0; i < MERIDIAN_COUNT; i += 1) {
      const lon = (i * Math.PI) / MERIDIAN_COUNT
      /* Two open arcs per great circle — gaps at both poles remove the wrap hook. */
      const arcs: Array<[number, number]> = [
        [cut, Math.PI - cut],
        [Math.PI + cut, Math.PI * 2 - cut],
      ]
      for (const [phiStart, phiEnd] of arcs) {
        const geometry = createMeridianArcGeometry(SPHERE_RADIUS, lon, phiStart, phiEnd)
        meridianGeometries.push(geometry)
        sphereGroup.add(new THREE.Line(geometry, meridianMaterial))
      }
    }

    const depthSphere = new THREE.Mesh(
      new THREE.SphereGeometry(DEPTH_SPHERE_RADIUS, 32, 24),
      new THREE.MeshBasicMaterial({ colorWrite: false }),
    )
    sphereGroup.add(depthSphere)

    /* Fixed silhouette — depthTest off so the depth shell cannot hide it. */
    const outlineMaterial = new THREE.LineBasicMaterial({
      color: rgbToHex(borderRgb),
      depthTest: false,
      depthWrite: false,
    })
    const outlineGeometry = createOutlineCircleGeometry(SPHERE_RADIUS, CAMERA_Z)
    const outlineCircle = new THREE.LineLoop(outlineGeometry, outlineMaterial)
    outlineCircle.renderOrder = 2
    scene.add(outlineCircle)

    const clusterGroup = new THREE.Group()
    scene.add(clusterGroup)

    const clusterPoints = fibonacciPoints(CLUSTER_COUNT, CLUSTER_RADIUS, rand)
    const centerIndex = clusterPoints.reduce((best, point, index, arr) => {
      return point.length() < arr[best].length() ? index : best
    }, 0)

    const clusterSprites: {
      sprite: THREE.Sprite
      baseScale: number
      material: THREE.SpriteMaterial
      texture: THREE.CanvasTexture
    }[] = []

    clusterPoints.forEach((point, index) => {
      const color = blueRamp[index % blueRamp.length]
      const texture = createBlurDotTexture(color)
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(material)
      const dist = point.length()
      const baseScale =
        index === centerIndex ? 2.3 : 0.8 + (1 - dist / CLUSTER_RADIUS) * 1.2 + rand() * 0.3
      sprite.scale.setScalar(baseScale)
      sprite.position.copy(point)
      clusterGroup.add(sprite)
      clusterSprites.push({ sprite, baseScale, material, texture })
    })

    const orbitGroup = new THREE.Group()
    scene.add(orbitGroup)

    const orbitSprites: {
      sprite: THREE.Sprite
      angle: number
      material: THREE.SpriteMaterial
    }[] = []
    const orbitPos = new THREE.Vector3()

    let eyeTexture: THREE.Texture | null = null
    let disposed = false
    let frameId = 0
    const worldPos = new THREE.Vector3()
    let scrollBoost = 0
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0
    let lastScrollTs = typeof performance !== 'undefined' ? performance.now() : 0
    let lastFrameTs = typeof performance !== 'undefined' ? performance.now() : 0

    const onScroll = () => {
      if (disposed || reducedMotion.matches) return
      const now = performance.now()
      const y = window.scrollY
      const dy = Math.abs(y - lastScrollY)
      const dt = Math.max(now - lastScrollTs, 1)
      lastScrollY = y
      lastScrollTs = now

      /* Boost scales with scroll speed: slow → small kick, fast → large. */
      const velocityPxPerMs = dy / dt
      scrollBoost = Math.min(
        SCROLL_SPIN_MAX_BOOST,
        scrollBoost + velocityPxPerMs * SCROLL_VELOCITY_GAIN,
      )
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const applyOrbitScale = () => {
      const scale = orbitWorldScale(container.clientHeight)
      for (const badge of orbitSprites) {
        badge.sprite.scale.setScalar(scale)
      }
    }

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      applyOrbitScale()
    }

    const observer = new ResizeObserver(() => resize())
    observer.observe(container)
    resize()

    const updateClusterDepthCue = () => {
      for (const item of clusterSprites) {
        item.sprite.getWorldPosition(worldPos)
        const t = THREE.MathUtils.clamp((worldPos.z + CLUSTER_RADIUS) / (CLUSTER_RADIUS * 2), 0, 1)
        const scaleMult = 0.6 + t * 0.65
        const opacityMult = 0.32 + t * 0.63
        item.sprite.scale.setScalar(item.baseScale * scaleMult)
        item.material.opacity = opacityMult
      }
    }

    const renderFrame = () => {
      updateClusterDepthCue()
      renderer.render(scene, camera)
    }

    const tick = (now: number) => {
      if (disposed) return

      const dtSec = Math.min(Math.max((now - lastFrameTs) / 1000, 0), 0.064)
      lastFrameTs = now

      scrollBoost *= Math.pow(SCROLL_SPIN_DECAY_PER_FRAME_60, dtSec * 60)
      if (scrollBoost < 0.02) scrollBoost = 0
      const spinMul = 1 + scrollBoost
      /* Per-frame constants were tuned at ~60fps — multiply by 60 for rad/s. */
      const frameScale = dtSec * 60

      sphereGroup.rotation.y += SPHERE_SPIN * spinMul * frameScale
      clusterGroup.rotation.y += CLUSTER_SPIN * spinMul * frameScale

      for (const badge of orbitSprites) {
        /* Negative so motion runs bottom-left → front → top-right (ref arrow). */
        badge.angle -= ORBIT_BASE_SPEED * spinMul * frameScale
        badge.sprite.position.copy(diagonalOrbitPosition(badge.angle, orbitPos))
      }

      renderFrame()
      frameId = window.requestAnimationFrame(tick)
    }

    const start = async () => {
      eyeTexture = await loadEyeBadgeTexture(inkRgb)
      if (disposed) {
        eyeTexture.dispose()
        return
      }

      for (let i = 0; i < ORBIT_COUNT; i += 1) {
        const material = new THREE.SpriteMaterial({
          map: eyeTexture,
          transparent: true,
          depthTest: true,
          depthWrite: false,
        })
        const sprite = new THREE.Sprite(material)
        const angle = (i / ORBIT_COUNT) * Math.PI * 2
        sprite.position.copy(diagonalOrbitPosition(angle, orbitPos))
        orbitGroup.add(sprite)
        orbitSprites.push({
          sprite,
          angle,
          material,
        })
      }
      applyOrbitScale()

      if (reducedMotion.matches) {
        renderFrame()
        return
      }
      frameId = window.requestAnimationFrame(tick)
    }

    void start()

    const onMotionChange = () => {
      window.cancelAnimationFrame(frameId)
      frameId = 0
      if (reducedMotion.matches) {
        renderFrame()
      } else {
        frameId = window.requestAnimationFrame(tick)
      }
    }
    reducedMotion.addEventListener('change', onMotionChange)

    return () => {
      disposed = true
      window.removeEventListener('scroll', onScroll)
      reducedMotion.removeEventListener('change', onMotionChange)
      window.cancelAnimationFrame(frameId)
      observer.disconnect()

      meridianGeometries.forEach((geometry) => geometry.dispose())
      meridianMaterial.dispose()
      outlineGeometry.dispose()
      outlineMaterial.dispose()
      depthSphere.geometry.dispose()
      ;(depthSphere.material as THREE.Material).dispose()

      clusterSprites.forEach(({ material, texture }) => {
        material.dispose()
        texture.dispose()
      })
      orbitSprites.forEach(({ material }) => material.dispose())
      eyeTexture?.dispose()

      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [containerRef])
}
