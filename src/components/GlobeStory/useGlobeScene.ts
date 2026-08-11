import { useEffect, type MutableRefObject, type RefObject } from 'react'
import * as THREE from 'three'
import usdcLogoUrl from '@/assets/usdc-logo.svg'

const SPHERE_RADIUS = 2.4
const DEPTH_SPHERE_RADIUS = 2.38
const MERIDIAN_COUNT = 7
const MERIDIAN_POLE_CUT = 0.38
/** Shared Y-spin — globe wireframe + USDC cluster stay in sync, horizontal only. */
const SPIN_Y = 0.0052
const CLUSTER_COUNT = 12
/** Cluster fill — tight enough to read as a core, not filling the shell. */
const CLUSTER_RADIUS = 1.55
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
/** Soft USDC canvas blur — strong enough to read clearly as privacy fog on scroll. */
const BLUR_PX = 22
const CAMERA_Z = 8.0
const CAMERA_FOV = 45
/** 30% smaller on stage. */
const STAGE_SCALE = 0.7
/** Front sprites scale up; back sprites shrink (world-Z depth cue). */
const DEPTH_SCALE_BACK = 0.42
const DEPTH_SCALE_FRONT = 1.45
/** Back tokens keep a soft haze even when scroll-blur is 0. */
const ATMOSPHERE_HAZE = 0.4
/** Minimum horizontal orbit radius so Y-spin always reads as motion. */
const MIN_ORBIT_RADIUS = 0.58
/**
 * Size tiers — ~40% smaller overall, still distinct front/back steps.
 */
const SIZE_TIERS = [0.92, 0.76, 0.62, 0.48, 0.34, 0.22] as const

export type GlobeMode = 'privacy' | 'capital'

export type GlobeSceneApi = {
  setBlur: (value: number) => void
  setMode: (mode: GlobeMode) => void
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

/**
 * SVGs without width/height often load with naturalWidth=0 and canvas drawImage
 * paints nothing. Re-encode with explicit size so the USDC glyph always draws.
 */
function loadUsdcImage(url: string): Promise<HTMLImageElement> {
  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to fetch USDC logo (${response.status})`)
      return response.text()
    })
    .then(
      (svgText) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          let svg = svgText
          if (!/\swidth\s*=/.test(svg)) {
            svg = svg.replace(/<svg\b/, '<svg width="256" height="256"')
          }
          const blob = new Blob([svg], { type: 'image/svg+xml' })
          const objectUrl = URL.createObjectURL(blob)
          const image = new Image()
          image.decoding = 'async'
          image.onload = () => {
            URL.revokeObjectURL(objectUrl)
            resolve(image)
          }
          image.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('Failed to decode USDC logo'))
          }
          image.src = objectUrl
        }),
    )
}

function createUsdcTexture(image: HTMLImageElement, blurPx: number): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.clearRect(0, 0, size, size)
  const inset = blurPx > 0 ? Math.ceil(blurPx * 2.4) : 12
  if (blurPx > 0) ctx.filter = `blur(${blurPx}px)`
  ctx.drawImage(image, inset, inset, size - inset * 2, size - inset * 2)
  ctx.filter = 'none'

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/** Canvas fallback if the SVG path fails — branded USDC circle. */
function createUsdcFallbackTexture(blurPx: number): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.clearRect(0, 0, size, size)
  if (blurPx > 0) ctx.filter = `blur(${blurPx}px)`
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  ctx.fillStyle = '#2775ca'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.round(size * 0.42)}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('$', cx, cy + size * 0.02)
  ctx.filter = 'none'

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function createMeridianArcGeometry(
  radius: number,
  lon: number,
  phiStart: number,
  phiEnd: number,
  segments = 48,
): THREE.BufferGeometry {
  const count = segments + 1
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const t = i / segments
    const phi = phiStart + (phiEnd - phiStart) * t
    const idx = i * 3
    positions[idx] = radius * Math.sin(phi) * Math.cos(lon)
    positions[idx + 1] = radius * Math.cos(phi)
    positions[idx + 2] = radius * Math.sin(phi) * Math.sin(lon)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

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

function fibonacciPoints(count: number, radius: number, rand: () => number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  for (let i = 0; i < count; i += 1) {
    const yNorm = ((i / (count - 1)) * 2 - 1) * 0.68
    const ring = Math.sqrt(Math.max(0.1, 1 - yNorm * yNorm))
    const theta = i * GOLDEN_ANGLE + rand() * 0.55
    const radial = radius * ring * (0.82 + rand() * 0.24)
    const point = new THREE.Vector3(
      Math.cos(theta) * radial,
      yNorm * radius * 0.9,
      Math.sin(theta) * radial,
    )
    const orbit = Math.hypot(point.x, point.z)
    if (orbit < MIN_ORBIT_RADIUS) {
      const push = MIN_ORBIT_RADIUS / Math.max(orbit, 0.001)
      point.x *= push
      point.z *= push
      point.y *= 0.88
    }
    points.push(point)
  }
  return points
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

/**
 * Wireframe globe + USDC cluster. Blur crossfades sharp→soft sprites on scroll.
 * Cluster spins on Y only — same direction as the globe, no diagonal/vertical tumble.
 */
export function useGlobeScene(
  containerRef: RefObject<HTMLElement | null>,
  apiRef: MutableRefObject<GlobeSceneApi | null>,
) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const rand = mulberry32(42)

    const strokeRgb = readCssColor('--diagram-stroke', container)

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

    // Cluster under wireframe: add first, keep low renderOrder.
    const clusterGroup = new THREE.Group()
    stage.add(clusterGroup)

    const sphereGroup = new THREE.Group()
    stage.add(sphereGroup)

    // Invisible shell writes depth so back meridians are occluded (front half only).
    const depthSphere = new THREE.Mesh(
      new THREE.SphereGeometry(DEPTH_SPHERE_RADIUS, 32, 24),
      new THREE.MeshBasicMaterial({ colorWrite: false }),
    )
    sphereGroup.add(depthSphere)

    const meridianMaterial = new THREE.LineBasicMaterial({
      color: rgbToHex(strokeRgb),
      transparent: true,
      opacity: 1,
      // depthTest on — back arcs fail against the depth shell.
      depthTest: true,
      depthWrite: false,
    })
    const meridianGeometries: THREE.BufferGeometry[] = []
    const cut = MERIDIAN_POLE_CUT
    for (let i = 0; i < MERIDIAN_COUNT; i += 1) {
      const lon = (i * Math.PI) / MERIDIAN_COUNT
      const arcs: Array<[number, number]> = [
        [cut, Math.PI - cut],
        [Math.PI + cut, Math.PI * 2 - cut],
      ]
      for (const [phiStart, phiEnd] of arcs) {
        const geometry = createMeridianArcGeometry(SPHERE_RADIUS, lon, phiStart, phiEnd)
        meridianGeometries.push(geometry)
        const line = new THREE.Line(geometry, meridianMaterial)
        line.renderOrder = 10
        sphereGroup.add(line)
      }
    }

    const outlineMaterial = new THREE.LineBasicMaterial({
      color: rgbToHex(strokeRgb),
      depthTest: false,
      depthWrite: false,
    })
    const outlineGeometry = createOutlineCircleGeometry(SPHERE_RADIUS, CAMERA_Z)
    const outlineCircle = new THREE.LineLoop(outlineGeometry, outlineMaterial)
    outlineCircle.renderOrder = 11
    stage.add(outlineCircle)

    type ClusterSprite = {
      sharp: THREE.Sprite
      soft: THREE.Sprite
      sharpMat: THREE.SpriteMaterial
      softMat: THREE.SpriteMaterial
      sharpTex: THREE.CanvasTexture
      softTex: THREE.CanvasTexture
      baseScale: number
    }

    const clusterSprites: ClusterSprite[] = []
    let blur = 0
    let mode: GlobeMode = 'privacy'
    let frame = 0
    let lastTime = performance.now()
    const worldPos = new THREE.Vector3()

    const applyBlur = (value: number) => {
      // Ease-in so mid-scroll already reads as heavy fog.
      blur = Math.pow(clamp01(value), 0.72)
    }

    /** Front = larger + crisp; back = smaller + cooler haze. */
    const updateClusterDepthCue = () => {
      const half = CLUSTER_RADIUS * STAGE_SCALE * 1.15
      for (const item of clusterSprites) {
        item.sharp.getWorldPosition(worldPos)
        const t = clamp01((worldPos.z + half) / (half * 2))
        const scaleMult = DEPTH_SCALE_BACK + (DEPTH_SCALE_FRONT - DEPTH_SCALE_BACK) * t
        const softBloom = 1 + blur * 0.4
        item.sharp.scale.setScalar(item.baseScale * scaleMult)
        item.soft.scale.setScalar(item.baseScale * scaleMult * softBloom)

        // Atmosphere: back stays slightly soft/cool even before scroll blur.
        const haze = (1 - t) * ATMOSPHERE_HAZE
        const softMix = clamp01(blur + (1 - blur) * haze)
        item.sharpMat.opacity = 1 - softMix
        item.softMat.opacity = softMix
        // Tint: front full white, back cooler and dimmer.
        const r = 0.58 + t * 0.42
        const g = 0.66 + t * 0.34
        const b = 0.78 + t * 0.22
        item.sharpMat.color.setRGB(r, g, b)
        item.softMat.color.setRGB(r * 0.9, g * 0.92, b)

        // Keep below wireframe (meridians/outline use 10+).
        const order = Math.round(t * 5)
        item.sharp.renderOrder = order
        item.soft.renderOrder = order
      }
    }

    const api: GlobeSceneApi = {
      setBlur: applyBlur,
      setMode: (next) => {
        mode = next
        // Keep capital chapter fogged without re-easing an already-eased value.
        if (mode === 'capital') blur = Math.max(blur, 0.78)
      },
    }
    apiRef.current = api

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width < 1 || height < 1) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now

      if (!reducedMotion.matches) {
        const spinBoost = mode === 'privacy' ? 1 : 0.85
        const step = SPIN_Y * spinBoost * (dt * 60)
        // Same Y axis only — no X/Z tumble.
        sphereGroup.rotation.y += step
        clusterGroup.rotation.y += step
      }

      updateClusterDepthCue()
      renderer.render(scene, camera)
    }

    const mountCluster = (sharpTex: THREE.CanvasTexture, softTex: THREE.CanvasTexture) => {
      if (cancelled || clusterSprites.length > 0) return

      const clusterPoints = fibonacciPoints(CLUSTER_COUNT, CLUSTER_RADIUS, rand)
      // Shuffle size tiers so large/small mix across the volume.
      const sizes = clusterPoints.map((_, index) => SIZE_TIERS[index % SIZE_TIERS.length])
      for (let i = sizes.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1))
        const tmp = sizes[i]
        sizes[i] = sizes[j]
        sizes[j] = tmp
      }

      clusterPoints.forEach((point, index) => {
        // depthTest off — same as PrivacySphere blobs; otherwise the depth shell
        // hides every sprite sitting inside the globe volume.
        const sharpMat = new THREE.SpriteMaterial({
          map: sharpTex,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          opacity: 1,
        })
        const softMat = new THREE.SpriteMaterial({
          map: softTex,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          opacity: 0,
        })
        const sharp = new THREE.Sprite(sharpMat)
        const soft = new THREE.Sprite(softMat)
        const baseScale = sizes[index] ?? SIZE_TIERS[SIZE_TIERS.length - 1]
        sharp.scale.setScalar(baseScale)
        soft.scale.setScalar(baseScale)
        sharp.position.copy(point)
        soft.position.copy(point)
        clusterGroup.add(sharp)
        clusterGroup.add(soft)
        clusterSprites.push({
          sharp,
          soft,
          sharpMat,
          softMat,
          sharpTex,
          softTex,
          baseScale,
        })
      })

      updateClusterDepthCue()
    }

    frame = requestAnimationFrame(tick)

    void loadUsdcImage(usdcLogoUrl)
      .then((image) => {
        mountCluster(createUsdcTexture(image, 0), createUsdcTexture(image, BLUR_PX))
      })
      .catch(() => {
        mountCluster(createUsdcFallbackTexture(0), createUsdcFallbackTexture(BLUR_PX))
      })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      apiRef.current = null
      meridianGeometries.forEach((geometry) => geometry.dispose())
      outlineGeometry.dispose()
      meridianMaterial.dispose()
      outlineMaterial.dispose()
      depthSphere.geometry.dispose()
      ;(depthSphere.material as THREE.Material).dispose()
      const disposed = new Set<THREE.Texture>()
      clusterSprites.forEach((item) => {
        item.sharpMat.dispose()
        item.softMat.dispose()
        if (!disposed.has(item.sharpTex)) {
          item.sharpTex.dispose()
          disposed.add(item.sharpTex)
        }
        if (!disposed.has(item.softTex)) {
          item.softTex.dispose()
          disposed.add(item.softTex)
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [apiRef, containerRef])
}
