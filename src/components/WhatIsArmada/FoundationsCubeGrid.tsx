import { useEffect, useRef } from 'react'
import styles from './FoundationsCubeGrid.module.css'

/**
 * Isometric cube lattice for the foundations panel.
 * Outline cubes stay still; the center Armada cube floats.
 * Scroll down spreads the lattice; scroll up pulls it back to center.
 *
 * 2:1 isometric with equal edge lengths on all faces (true cube).
 * EXCEPTION — sizes/gap from marketing ref; no cube tokens.
 */
/** Odd size so there is a single floating center cube. */
const GRID = 9
const CENTER = (GRID - 1) / 2

/** Half-width of the top diamond (= half horizontal diagonal). */
const W = 44
/** Half-height of the top diamond (2:1 iso). */
const TOP_H = W / 2
/** Edge length of the top rhombus — also used as vertical extrusion. */
const EDGE = Math.sqrt(W * W + TOP_H * TOP_H)
/** Vertical side height so faces match the top edges. */
const H = EDGE
/** Resting gap between cube centers. */
const GAP_MIN = 8
/** Fully spread gap at end of scroll scrub (subtle). */
const GAP_MAX = 22
const STEP_MIN = W + GAP_MIN
const STEP_MAX = W + GAP_MAX
/**
 * Shift resting lattice so the center sits on the STEP_MAX viewBox center line
 * (otherwise a tight cluster looks off-center in the oversized viewBox).
 */
const LATTICE_Y_SHIFT = CENTER * (STEP_MAX - STEP_MIN)

/**
 * Pre-projected cube-face mark from designs/cube-logo.svg (viewBox 0 0 122 60).
 * Already drawn in 2:1 isometric space — maps 1:1 onto the top diamond.
 */
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

type Cell = {
  row: number
  col: number
  /** Position at STEP_MIN (resting / scroll-up). */
  cx: number
  cy: number
  isCenter: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function buildCells(): Cell[] {
  const cells: Cell[] = []
  for (let row = 0; row < GRID; row += 1) {
    for (let col = 0; col < GRID; col += 1) {
      cells.push({
        row,
        col,
        cx: (col - row) * STEP_MIN,
        cy: (col + row) * (STEP_MIN / 2) + LATTICE_Y_SHIFT,
        isCenter: row === CENTER && col === CENTER,
      })
    }
  }
  /* Painter’s algorithm: back → front (row+col ascending). */
  return cells.sort((a, b) => a.row + a.col - (b.row + b.col) || a.col - b.col)
}

function topPath(cx: number, cy: number): string {
  return [
    `M ${cx} ${cy - TOP_H}`,
    `L ${cx + W} ${cy}`,
    `L ${cx} ${cy + TOP_H}`,
    `L ${cx - W} ${cy}`,
    'Z',
  ].join(' ')
}

function leftPath(cx: number, cy: number): string {
  return [
    `M ${cx - W} ${cy}`,
    `L ${cx} ${cy + TOP_H}`,
    `L ${cx} ${cy + TOP_H + H}`,
    `L ${cx - W} ${cy + H}`,
    'Z',
  ].join(' ')
}

function rightPath(cx: number, cy: number): string {
  return [
    `M ${cx + W} ${cy}`,
    `L ${cx} ${cy + TOP_H}`,
    `L ${cx} ${cy + TOP_H + H}`,
    `L ${cx + W} ${cy + H}`,
    'Z',
  ].join(' ')
}

function OutlineCube({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g className={styles.outlineCube}>
      <path className={styles.faceFill} d={leftPath(cx, cy)} />
      <path className={styles.faceFill} d={rightPath(cx, cy)} />
      <path className={styles.faceFill} d={topPath(cx, cy)} />
    </g>
  )
}

function ArmadaCube({ cx, cy }: { cx: number; cy: number }) {
  /* Map logo onto the top diamond with inset margin (already isometric). */
  const markInset = 0.62
  const markTransform = [
    `translate(${cx}, ${cy})`,
    `scale(${((2 * W) / LOGO_W) * markInset}, ${((2 * TOP_H) / LOGO_H) * markInset})`,
    `translate(${-LOGO_W / 2}, ${-LOGO_H / 2})`,
  ].join(' ')

  return (
    <g className={styles.armadaCube}>
      <path className={styles.faceFill} d={leftPath(cx, cy)} />
      <path className={styles.faceFill} d={rightPath(cx, cy)} />
      <path className={styles.faceTop} d={topPath(cx, cy)} />
      <g className={styles.mark} transform={markTransform} aria-hidden>
        {CUBE_LOGO_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </g>
  )
}

const CELLS = buildCells()

/*
 * ViewBox matches the old 3×3 window (same cube scale), centered on the Armada cube.
 * The larger lattice extends past this window so cubes bleed at the panel edges.
 */
const VB_PAD = 8
const VIEW_EXTENT = 2 /* half-span in grid steps — same as former 3×3 */
const viewSpan = VIEW_EXTENT * STEP_MAX
const centerY = CENTER * STEP_MAX
const VB_W = 2 * viewSpan + 2 * W + 2 * VB_PAD
const VB_H = 2 * viewSpan + 2 * TOP_H + H + 2 * VB_PAD
const VB_MIN_X = -VB_W / 2
const VB_MIN_Y = centerY + H / 2 - VB_H / 2
const VB_W_BOX = VB_W
const VB_H_BOX = VB_H

/**
 * Battle-tested foundations diagram: isometric cube grid with a floating Armada cube.
 * Lattice spacing scrubbed by scroll progress through the diagram.
 */
export function FoundationsCubeGrid() {
  const rootRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<(SVGGElement | null)[]>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let listening = false

    const applySpread = (progress: number) => {
      const dStep = (STEP_MAX - STEP_MIN) * progress
      CELLS.forEach((cell, i) => {
        const el = cellRefs.current[i]
        if (!el) return
        const dx = (cell.col - cell.row) * dStep
        const dy = ((cell.col + cell.row) / 2 - CENTER) * dStep
        if (dx === 0 && dy === 0) {
          el.removeAttribute('transform')
        } else {
          el.setAttribute('transform', `translate(${dx}, ${dy})`)
        }
      })
    }

    const scrub = () => {
      frame = 0
      if (reducedMotion.matches) {
        applySpread(0)
        return
      }

      const rect = root.getBoundingClientRect()
      const viewH = window.innerHeight
      const travel = viewH + rect.height
      const passed = viewH - rect.top
      const raw = clamp(passed / travel, 0, 1)

      /* Active in the middle of travel — tight on enter, spread as you leave. */
      const startAt = 0.2
      const endAt = 0.72
      const progress = clamp((raw - startAt) / (endAt - startAt), 0, 1)
      applySpread(progress)
    }

    const requestScrub = () => {
      if (frame) return
      frame = requestAnimationFrame(scrub)
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

    const onMotionChange = () => requestScrub()
    reducedMotion.addEventListener('change', onMotionChange)

    return () => {
      io.disconnect()
      stopListening()
      reducedMotion.removeEventListener('change', onMotionChange)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={styles.root}
      role="img"
      aria-label="Isometric grid of cubes with the Armada cube floating at the center"
    >
      <svg
        className={styles.svg}
        viewBox={`${VB_MIN_X} ${VB_MIN_Y} ${VB_W_BOX} ${VB_H_BOX}`}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
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
            <stop offset="0%" stopColor="var(--semantic-color-brand-lavender)" />
            <stop offset="100%" stopColor="var(--semantic-color-brand-amber)" />
          </linearGradient>
        </defs>

        {CELLS.map((cell, i) => (
          <g
            key={`${cell.row}-${cell.col}`}
            ref={(el) => {
              cellRefs.current[i] = el
            }}
          >
            {cell.isCenter ? (
              <g className={styles.float}>
                <ArmadaCube cx={cell.cx} cy={cell.cy} />
              </g>
            ) : (
              <OutlineCube cx={cell.cx} cy={cell.cy} />
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
