import { useEffect, type RefObject } from 'react'
import * as THREE from 'three'
import usdcLogoUrl from '@/assets/usdc-logo.svg'

const SPHERE_RADIUS = 2.4
const DEPTH_SPHERE_RADIUS = 2.38
const MERIDIAN_COUNT = 7
const MERIDIAN_OPACITY = 0.4
const SPHERE_SPIN = 0.0048

const CLUSTER_COUNT = 12
const CLUSTER_RADIUS = 1.4
const CLUSTER_SPIN = 0.0064
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const BLUR_PX = 8.4

const COIN_COUNT = 3
const COIN_ORBIT = 3.15
const COIN_BASE_SPEED = 0.009
const COIN_SPEED_MULT = [1, 0.85, 1] as const
/** Fixed heights: top / center / bottom (no vertical drift). */
const COIN_HEIGHTS = [1.72, 0.42, -1.25] as const
/** Per-coin scale: bottom coin reads larger. */
const COIN_SCALES = [0.72, 0.72, 0.98] as const

const CAMERA_Z = 9
const CAMERA_FOV = 45

type Rgb = { r: number; g: number; b: number }

function readCssColor(varName: string): Rgb {
  const probe = document.createElement('div')
  probe.style.color = `var(${varName})`
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  document.body.appendChild(probe)
  const raw = getComputedStyle(probe).color
  document.body.removeChild(probe)
  const match = raw.match(/[\d.]+/g)
  if (!match || match.length < 3) return { r: 46, g: 35, b: 35 }
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

function createPlaceholderCoinTexture(brand: Rgb): THREE.CanvasTexture {
  // TODO: replace if usdc-logo.svg fails to load — branded circle fallback.
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = `rgb(${brand.r},${brand.g},${brand.b})`
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.32, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.round(size * 0.42)}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('$', size / 2, size / 2 + 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function loadUsdcTexture(fallbackBrand: Rgb): Promise<THREE.Texture> {
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
        resolve(createPlaceholderCoinTexture(fallbackBrand))
        return
      }
      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(image, 0, 0, size, size)
      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      resolve(texture)
    }
    image.onerror = () => {
      resolve(createPlaceholderCoinTexture(fallbackBrand))
    }
    image.src = usdcLogoUrl
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

function createMeridianGeometry(radius: number, longitude: number, segments = 96): THREE.BufferGeometry {
  const positions = new Float32Array((segments + 1) * 3)
  for (let i = 0; i <= segments; i += 1) {
    const phi = (i / segments) * Math.PI * 2
    const x = radius * Math.sin(phi) * Math.cos(longitude)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(longitude)
    const idx = i * 3
    positions[idx] = x
    positions[idx + 1] = y
    positions[idx + 2] = z
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

    const borderRgb = readCssColor('--semantic-color-border-default')
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
    for (let i = 0; i < MERIDIAN_COUNT; i += 1) {
      const lon = (i * Math.PI) / MERIDIAN_COUNT
      const geometry = createMeridianGeometry(SPHERE_RADIUS, lon)
      meridianGeometries.push(geometry)
      sphereGroup.add(new THREE.Line(geometry, meridianMaterial))
    }

    const depthSphere = new THREE.Mesh(
      new THREE.SphereGeometry(DEPTH_SPHERE_RADIUS, 32, 24),
      new THREE.MeshBasicMaterial({ colorWrite: false }),
    )
    sphereGroup.add(depthSphere)

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

    const coinGroup = new THREE.Group()
    scene.add(coinGroup)

    const coinSprites: {
      sprite: THREE.Sprite
      angle: number
      speedMult: number
      height: number
      scale: number
      material: THREE.SpriteMaterial
    }[] = []

    let coinTexture: THREE.Texture | null = null
    let disposed = false
    let frameId = 0
    const worldPos = new THREE.Vector3()

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
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

    const tick = () => {
      if (disposed) return
      sphereGroup.rotation.y += SPHERE_SPIN
      clusterGroup.rotation.y += CLUSTER_SPIN

      for (const coin of coinSprites) {
        coin.angle += COIN_BASE_SPEED * coin.speedMult
        coin.sprite.position.set(
          Math.cos(coin.angle) * COIN_ORBIT,
          coin.height,
          Math.sin(coin.angle) * COIN_ORBIT,
        )
      }

      renderFrame()
      frameId = window.requestAnimationFrame(tick)
    }

    const start = async () => {
      coinTexture = await loadUsdcTexture(infoRgb)
      if (disposed) {
        coinTexture.dispose()
        return
      }

      for (let i = 0; i < COIN_COUNT; i += 1) {
        const material = new THREE.SpriteMaterial({
          map: coinTexture,
          transparent: true,
          depthTest: true,
          depthWrite: false,
        })
        const sprite = new THREE.Sprite(material)
        const scale = COIN_SCALES[i]
        sprite.scale.setScalar(scale)
        const angle = (i / COIN_COUNT) * Math.PI * 2
        const height = COIN_HEIGHTS[i]
        sprite.position.set(Math.cos(angle) * COIN_ORBIT, height, Math.sin(angle) * COIN_ORBIT)
        coinGroup.add(sprite)
        coinSprites.push({
          sprite,
          angle,
          speedMult: COIN_SPEED_MULT[i],
          height,
          scale,
          material,
        })
      }

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
      reducedMotion.removeEventListener('change', onMotionChange)
      window.cancelAnimationFrame(frameId)
      observer.disconnect()

      meridianGeometries.forEach((geometry) => geometry.dispose())
      meridianMaterial.dispose()
      depthSphere.geometry.dispose()
      ;(depthSphere.material as THREE.Material).dispose()

      clusterSprites.forEach(({ material, texture }) => {
        material.dispose()
        texture.dispose()
      })
      coinSprites.forEach(({ material }) => material.dispose())
      coinTexture?.dispose()

      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [containerRef])
}
