import { useEffect, useRef } from 'react'
import styles from './FoundationsCubeGrid.module.css'

/**
 * Foundations diagram: every cube is the same 2:1-projected 3D mesh.
 * All faces are depth-sorted so front cubes occlude back ones.
 * Center Armada cube: opaque sides, gradient top + inset logo; rises and yaws.
 *
 * EXCEPTION — sizes/gap from marketing ref; no cube tokens.
 */
const GRID = 9
const CENTER = (GRID - 1) / 2

const W = 44
const TOP_H = W / 2
const EDGE = Math.sqrt(W * W + TOP_H * TOP_H)
const HALF = EDGE / 2
const GAP_MIN = 8
const GAP_MAX = 22
const STEP_MIN = W + GAP_MIN
const STEP_MAX = W + GAP_MAX

const SCALE = W / EDGE
const SPACE_MIN = STEP_MIN / SCALE
const SPACE_MAX = STEP_MAX / SCALE

/** World-Y lift so the Armada cube clears the lattice tops. */
const FLOAT_AMP = 52
const FLOAT_CYCLE_MS = 5200
/** Logo size as fraction of top face (lower = more margin). */
const LOGO_INSET = 0.58

const LOGO_W = 122
const LOGO_H = 60
const CUBE_LOGO_PATHS = [
  'M61 60L70.9855 55.0891H51.0145L61 60Z',
  'M44.432 51.8518H77.568L85.7961 47.8052H36.2039L44.432 51.8518Z',
  'M29.6213 44.5679H92.3787L100.607 40.5212H69.1406L60.9968 44.5264L52.853 40.5212H21.3932L29.6213 44.5679Z',
  'M75.7231 37.2839H107.189L116.24 32.8326H84.774L75.7231 37.2839Z',
  'M14.8107 37.2839H46.2705L37.2195 32.8326H5.7597L14.8107 37.2839Z',
  'M-1.5659e-06 30H31.4598L60.9968 15.4736L90.5338 30H122L61 0L-1.5659e-06 30Z',
] as const

type V3 = { x: number; y: number; z: number }
type V2 = { x: number; y: number }

type FaceKind = 'top' | 'side'

type PaintedFace = {
  kind: FaceKind
  isArmada: boolean
  d: string
  depth: number
  topQuad?: V2[]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Continuous bob: ease up then straight back down (no hold at the peak).
 * Yaw starts with the rise and finishes as the cube settles.
 */
function sampleArmadaMotion(t: number): { y: number; yawRad: number } {
  /* Smooth full-cycle sine: 0 → peak → 0 with no plateau. */
  const y = -FLOAT_AMP * Math.sin(Math.PI * t)
  const yawRad = t * Math.PI * 2

  return { y, yawRad }
}

function rotateY(p: V3, rad: number): V3 {
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c }
}

function project(p: V3): V2 {
  return {
    x: (p.x - p.z) * SCALE,
    y: ((p.x + p.z) * SCALE) / 2 - (p.y - HALF),
  }
}

function facePath(points: V2[]): string {
  return `${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} Z`
}

/** Outward normal from first three corners (right-hand winding). */
function faceNormal(corners: V3[]): V3 {
  const [a, b, c] = corners
  const abx = b.x - a.x
  const aby = b.y - a.y
  const abz = b.z - a.z
  const acx = c.x - a.x
  const acy = c.y - a.y
  const acz = c.z - a.z
  return {
    x: aby * acz - abz * acy,
    y: abz * acx - abx * acz,
    z: abx * acy - aby * acx,
  }
}

/**
 * Camera sits above toward +X/+Z. Face is visible when outward normal
 * points toward the camera (n · cam > 0).
 */
function isFrontFacing(corners: V3[]): boolean {
  const n = faceNormal(corners)
  return n.x * 1 + n.y * 2 + n.z * 1 > 0
}

/** Larger = closer to camera; paint ascending (back → front). */
function faceDepth(corners: V3[]): number {
  return corners.reduce((sum, p) => sum + p.x + p.y + p.z, 0) / corners.length
}

/**
 * Local faces with outward normals (CCW from outside).
 * At yaw 0 the camera sees top, +X, and +Z.
 */
const LOCAL_FACES: { kind: FaceKind; corners: V3[] }[] = [
  {
    kind: 'top',
    corners: [
      { x: -HALF, y: HALF, z: -HALF },
      { x: -HALF, y: HALF, z: HALF },
      { x: HALF, y: HALF, z: HALF },
      { x: HALF, y: HALF, z: -HALF },
    ],
  },
  {
    /* +Z */
    kind: 'side',
    corners: [
      { x: -HALF, y: HALF, z: HALF },
      { x: -HALF, y: -HALF, z: HALF },
      { x: HALF, y: -HALF, z: HALF },
      { x: HALF, y: HALF, z: HALF },
    ],
  },
  {
    /* +X */
    kind: 'side',
    corners: [
      { x: HALF, y: HALF, z: HALF },
      { x: HALF, y: -HALF, z: HALF },
      { x: HALF, y: -HALF, z: -HALF },
      { x: HALF, y: HALF, z: -HALF },
    ],
  },
  {
    /* -Z */
    kind: 'side',
    corners: [
      { x: HALF, y: HALF, z: -HALF },
      { x: HALF, y: -HALF, z: -HALF },
      { x: -HALF, y: -HALF, z: -HALF },
      { x: -HALF, y: HALF, z: -HALF },
    ],
  },
  {
    /* -X */
    kind: 'side',
    corners: [
      { x: -HALF, y: HALF, z: -HALF },
      { x: -HALF, y: -HALF, z: -HALF },
      { x: -HALF, y: -HALF, z: HALF },
      { x: -HALF, y: HALF, z: HALF },
    ],
  },
]

/**
 * Map cube-logo.svg onto the inset top face.
 * Asset is already isometric: tip (61,0) → screen-top corner, base → bottom.
 * top[] order: [top, left, bottom, right] in screen space at yaw 0.
 */
function logoMatrix(top: V2[], inset: number): string {
  const cx = top.reduce((sum, p) => sum + p.x, 0) / top.length
  const cy = top.reduce((sum, p) => sum + p.y, 0) / top.length
  const q = top.map((p) => ({
    x: cx + (p.x - cx) * inset,
    y: cy + (p.y - cy) * inset,
  }))
  const mid = { x: cx, y: cy }
  /* SVG +x → right tip; SVG +y (down) → bottom tip — 90° from corner-bbox mapping. */
  const right = q[3]
  const down = q[2]
  const a = (right.x - mid.x) / (LOGO_W / 2)
  const b = (right.y - mid.y) / (LOGO_W / 2)
  const c = (down.x - mid.x) / (LOGO_H / 2)
  const d = (down.y - mid.y) / (LOGO_H / 2)
  const e = mid.x - a * (LOGO_W / 2) - c * (LOGO_H / 2)
  const f = mid.y - b * (LOGO_W / 2) - d * (LOGO_H / 2)
  return `matrix(${a} ${b} ${c} ${d} ${e} ${f})`
}

type CubeSpec = { row: number; col: number; isArmada: boolean }

const CUBES: CubeSpec[] = (() => {
  const list: CubeSpec[] = []
  for (let row = 0; row < GRID; row += 1) {
    for (let col = 0; col < GRID; col += 1) {
      list.push({ row, col, isArmada: row === CENTER && col === CENTER })
    }
  }
  return list
})()

function cubeOrigin(row: number, col: number, space: number): V3 {
  return {
    x: (col - CENTER) * space,
    y: 0,
    z: (row - CENTER) * space,
  }
}

function collectFaces(space: number, armadaYaw: number, armadaFloatY: number): PaintedFace[] {
  const painted: PaintedFace[] = []

  for (const cube of CUBES) {
    const origin = cubeOrigin(cube.row, cube.col, space)
    const yaw = cube.isArmada ? armadaYaw : 0
    const floatY = cube.isArmada ? armadaFloatY : 0

    for (const face of LOCAL_FACES) {
      const world = face.corners.map((p) => {
        const r = rotateY(p, yaw)
        return {
          x: r.x + origin.x,
          /* Motion y is negative-up in the old screen sense → lift world +Y. */
          y: r.y + origin.y - floatY,
          z: r.z + origin.z,
        }
      })
      if (!isFrontFacing(world)) continue

      const screen = world.map(project)

      painted.push({
        kind: face.kind,
        isArmada: cube.isArmada,
        d: facePath(screen),
        depth: faceDepth(world),
        topQuad: face.kind === 'top' && cube.isArmada ? screen : undefined,
      })
    }
  }

  painted.sort((a, b) => a.depth - b.depth)
  return painted
}

const VIEW_EXTENT = 2
const viewSpan = VIEW_EXTENT * STEP_MAX
const VIEW_W = 2 * viewSpan + 2 * W + 16
const VIEW_H = 2 * viewSpan + 2 * TOP_H + EDGE + FLOAT_AMP * 2 + 24
const VIEW_MIN_X = -VIEW_W / 2
const VIEW_MIN_Y = EDGE / 2 - VIEW_H / 2 - FLOAT_AMP * 0.35

const MAX_FACE_PATHS = GRID * GRID * 3

export function FoundationsCubeGrid() {
  const rootRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<SVGGElement | null>(null)
  const pathPoolRef = useRef<SVGPathElement[]>([])
  const markRef = useRef<SVGGElement | null>(null)
  const spaceRef = useRef(SPACE_MIN)
  const motionRef = useRef({ y: 0, yaw: 0 })

  useEffect(() => {
    const root = rootRef.current
    const layer = layerRef.current
    if (!root || !layer) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let scrubFrame = 0
    let motionFrame = 0
    let listening = false
    let disposed = false

    const pool = pathPoolRef.current
    if (pool.length === 0) {
      for (let i = 0; i < MAX_FACE_PATHS; i += 1) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('stroke-linejoin', 'round')
        path.setAttribute('vector-effect', 'non-scaling-stroke')
        path.style.display = 'none'
        layer.insertBefore(path, markRef.current)
        pool.push(path)
      }
    }

    const rootStyle = getComputedStyle(root)
    const fillSolid =
      rootStyle.getPropertyValue('--cube-face-fill').trim() ||
      rootStyle.getPropertyValue('--semantic-color-brand-deep').trim() ||
      '#291433'
    const stroke =
      rootStyle.getPropertyValue('--cube-stroke').trim() ||
      rootStyle.getPropertyValue('--diagram-stroke').trim() ||
      '#5a4a62'

    const paint = () => {
      const faces = collectFaces(spaceRef.current, motionRef.current.yaw, motionRef.current.y)
      let armadaTop: V2[] | undefined
      let armadaTopIndex = -1

      faces.forEach((face, i) => {
        const path = pool[i]
        if (!path) return
        path.style.display = ''
        path.setAttribute('d', face.d)
        path.setAttribute('stroke', stroke)
        path.setAttribute('stroke-width', '1')
        /* Explicit fills — SVG root fill="none" must not win; CSS alone was unreliable. */
        if (face.kind === 'top' && face.isArmada) {
          path.setAttribute('fill', 'url(#armadaCubeTop)')
          path.setAttribute('class', styles.faceTop)
        } else {
          path.setAttribute('fill', fillSolid)
          path.setAttribute('class', styles.faceFill)
        }
        if (face.topQuad) {
          armadaTop = face.topQuad
          armadaTopIndex = i
        }
      })
      for (let i = faces.length; i < pool.length; i += 1) {
        pool[i].style.display = 'none'
      }

      const mark = markRef.current
      if (mark) {
        if (armadaTop && armadaTopIndex >= 0 && pool[armadaTopIndex]) {
          const afterTop = pool[armadaTopIndex].nextSibling
          if (afterTop !== mark) layer.insertBefore(mark, afterTop)
          mark.setAttribute('transform', logoMatrix(armadaTop, LOGO_INSET))
          mark.style.display = ''
        } else {
          mark.style.display = 'none'
        }
      }
    }

    const scrub = () => {
      scrubFrame = 0
      if (reducedMotion.matches) {
        spaceRef.current = SPACE_MIN
        return
      }
      const rect = root.getBoundingClientRect()
      const viewH = window.innerHeight
      const travel = viewH + rect.height
      const passed = viewH - rect.top
      const raw = clamp(passed / travel, 0, 1)
      spaceRef.current = SPACE_MIN + (SPACE_MAX - SPACE_MIN) * clamp((raw - 0.2) / 0.52, 0, 1)
    }

    const requestScrub = () => {
      if (scrubFrame) return
      scrubFrame = requestAnimationFrame(scrub)
    }

    const tick = (now: number) => {
      if (disposed) return
      if (reducedMotion.matches) motionRef.current = { y: 0, yaw: 0 }
      else {
        const { y, yawRad } = sampleArmadaMotion((now % FLOAT_CYCLE_MS) / FLOAT_CYCLE_MS)
        motionRef.current = { y, yaw: yawRad }
      }
      paint()
      motionFrame = requestAnimationFrame(tick)
    }

    const startListening = () => {
      if (listening) return
      listening = true
      window.addEventListener('scroll', requestScrub, { passive: true })
      window.addEventListener('resize', requestScrub)
      requestScrub()
    }

    const stopListening = () => {
      if (!listening) return
      listening = false
      window.removeEventListener('scroll', requestScrub)
      window.removeEventListener('resize', requestScrub)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startListening()
        else stopListening()
      },
      { root: null, threshold: 0, rootMargin: '20% 0px' },
    )

    io.observe(root)
    requestScrub()
    startListening()
    motionFrame = requestAnimationFrame(tick)

    const onMotionChange = () => requestScrub()
    reducedMotion.addEventListener('change', onMotionChange)

    return () => {
      disposed = true
      io.disconnect()
      stopListening()
      reducedMotion.removeEventListener('change', onMotionChange)
      if (scrubFrame) cancelAnimationFrame(scrubFrame)
      if (motionFrame) cancelAnimationFrame(motionFrame)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={styles.root}
      role="img"
      aria-label="Isometric grid of cubes with the Armada cube rising and spinning at the center"
    >
      <svg
        className={styles.svg}
        viewBox={`${VIEW_MIN_X} ${VIEW_MIN_Y} ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient
            id="armadaCubeTop"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" className={styles.gradStopLavender} />
            <stop offset="52%" className={styles.gradStopRose} />
            <stop offset="100%" className={styles.gradStopAmber} />
          </linearGradient>
        </defs>

        <g ref={layerRef}>
          <g ref={markRef} className={styles.mark} aria-hidden>
            {CUBE_LOGO_PATHS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  )
}
