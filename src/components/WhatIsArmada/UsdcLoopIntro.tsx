import { useEffect, useId, useRef, useState } from 'react'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import type { ButtonVariant } from '@/components/Button'
import styles from './UsdcLoopIntro.module.css'

type Cta = {
  label: string
  href: string
  external?: boolean
  variant: Extract<ButtonVariant, 'primary' | 'secondary' | 'ghost'>
}

export type UsdcLoopIntroContent = {
  title: readonly [string, string]
  body: string
  ctas: Cta[]
}

/**
 * Figma path3 export (`src/assets/usdc-loop-path.svg`).
 * Concentric gem-gradient strokes + gradient center disc.
 */
const VIEWBOX = '0 0 2894 2894'
const CX = 1446.96
const CY = 1446.96
/** EXCEPTION — Figma stroke-width 138.347 (no spacing token). */
const STROKE = 138.347
const CENTER_R = 429.195

const GEM = {
  lavender: '#ca8aea',
  rose: '#f39db0',
  amber: '#f8d197',
} as const

type RingDef = {
  r: number
  rotate?: number
  /** Gradient line in user space (from path3). */
  x1: number
  y1: number
  y2: number
}

/**
 * Gradient / rotation variety from path3. Radii are rebuilt as an exact
 * arithmetic sequence (center + half stroke + i × stroke) so every band has
 * the same width and sits flush — Figma export radii were slightly uneven.
 */
const RING_STYLE: Omit<RingDef, 'r'>[] = [
  { rotate: 28.471, x1: 918.73, y1: 1927.97, y2: 784.565 },
  { x1: 772.092, y1: 600.681, y2: 2061.5 },
  { rotate: -16.7763, x1: 622.954, y1: 2197.3, y2: 413.665 },
  { x1: 473.815, y1: 226.647, y2: 2333.11 },
  { rotate: 35.9691, x1: 326.762, y1: 2467.01, y2: 42.244 },
  { x1: 186.196, y1: -134.024, y2: 2595.01 },
  { x1: 39.1426, y1: 2728.92, y2: -318.428 },
]

const RINGS: RingDef[] = RING_STYLE.map((style, i) => ({
  ...style,
  r: CENTER_R + STROKE / 2 + i * STROKE,
}))

/** Two USDC per ring, opposite sides (start and start + π), shared direction/speed.
 * Inner rings crawl; outer rings run faster. */
const TRAVELERS = RINGS.flatMap((_, ring) => {
  const start = (ring * 0.55) % (Math.PI * 2)
  const dir = ring % 2 === 0 ? (1 as const) : (-1 as const)
  // ring 0 = innermost (slowest) → outer rings progressively faster
  const revPerSec = 0.01 + ring * 0.005
  return [
    { ring, start, dir, revPerSec },
    { ring, start: start + Math.PI, dir, revPerSec },
  ]
})

const WASH_MAX_ALPHA = 40
/**
 * Branded TokenUSDC circle is r=9 in a 24 viewBox (18/24 of the box).
 * Size the box so the visible coin diameter equals the rendered ring stroke.
 */
const USDC_GLYPH_FILL = 18 / 24
/** EXCEPTION — max stage blur while pinned (no blur token). */
const BLUR_MAX_PX = 56
const BLUR_FULL_AT = 0.55

type UsdcLoopIntroProps = {
  content: UsdcLoopIntroContent
}

/**
 * Sticky path3 concentric gem rings + gradient center. Copy on top;
 * stage blurs and lavender veil builds on scroll.
 */
export function UsdcLoopIntro({ content }: UsdcLoopIntroProps) {
  const uid = useId().replace(/:/g, '')
  const pinRef = useRef<HTMLDivElement>(null)
  const washRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const travelerRefs = useRef<(HTMLDivElement | null)[]>([])
  const frameRef = useRef(0)
  const [tokenSize, setTokenSize] = useState(Math.round(STROKE / USDC_GLYPH_FILL))

  useEffect(() => {
    const pin = pinRef.current
    const wash = washRef.current
    const stage = stageRef.current
    if (!pin || !wash || !stage) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncScrollFx = () => {
      if (reducedMotion.matches) {
        stage.style.filter = `blur(${BLUR_MAX_PX}px)`
        wash.style.background = `color-mix(in srgb, var(--semantic-color-brand-lavender) ${WASH_MAX_ALPHA}%, transparent)`
        return
      }

      const scrollable = pin.offsetHeight - window.innerHeight
      if (scrollable <= 0) {
        stage.style.filter = 'blur(0px)'
        wash.style.background =
          'color-mix(in srgb, var(--semantic-color-brand-lavender) 0%, transparent)'
        return
      }

      const scrolled = Math.min(scrollable, Math.max(0, -pin.getBoundingClientRect().top))
      const t = scrolled / scrollable
      const blurT = Math.min(1, t / BLUR_FULL_AT)
      stage.style.filter = `blur(${blurT * BLUR_MAX_PX}px)`
      wash.style.background = `color-mix(in srgb, var(--semantic-color-brand-lavender) ${blurT * WASH_MAX_ALPHA}%, transparent)`
    }

    syncScrollFx()
    window.addEventListener('scroll', syncScrollFx, { passive: true })
    window.addEventListener('resize', syncScrollFx)
    reducedMotion.addEventListener('change', syncScrollFx)

    return () => {
      window.removeEventListener('scroll', syncScrollFx)
      window.removeEventListener('resize', syncScrollFx)
      reducedMotion.removeEventListener('change', syncScrollFx)
    }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    const svg = svgRef.current
    if (!stage || !svg) return

    const travelers = travelerRefs.current.filter(Boolean) as HTMLDivElement[]
    if (travelers.length === 0) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncTokenSize = () => {
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const strokePx = Math.max(1, STROKE * Math.hypot(ctm.a, ctm.b))
      const boxPx = Math.max(24, Math.round(strokePx / USDC_GLYPH_FILL))
      setTokenSize(boxPx)
      const size = `${boxPx}px`
      for (const el of travelers) {
        el.style.width = size
        el.style.height = size
      }
    }

    const place = (el: HTMLDivElement, radius: number, angle: number, dir: 1 | -1) => {
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      // Path3 coords are centered at (CX, CY).
      const x = CX + radius * Math.cos(angle)
      const y = CY + radius * Math.sin(angle)
      const stageBox = stage.getBoundingClientRect()
      const sx = ctm.a * x + ctm.c * y + ctm.e - stageBox.left
      const sy = ctm.b * x + ctm.d * y + ctm.f - stageBox.top
      const tangentDeg = (angle * 180) / Math.PI + (dir > 0 ? 90 : -90)
      el.style.transform = `translate(${sx}px, ${sy}px) rotate(${tangentDeg}deg)`
      el.style.opacity = '1'
    }

    const placeAll = (elapsedSec: number) => {
      TRAVELERS.forEach((t, i) => {
        const el = travelers[i]
        const ring = RINGS[t.ring]
        if (!el || !ring) return
        const angle = t.start + elapsedSec * t.revPerSec * Math.PI * 2 * t.dir
        place(el, ring.r, angle, t.dir)
      })
    }

    syncTokenSize()
    placeAll(0)

    if (reducedMotion.matches) {
      return
    }

    const start = performance.now()
    let running = true

    const tick = (now: number) => {
      if (!running) return
      placeAll((now - start) / 1000)
      frameRef.current = requestAnimationFrame(tick)
    }

    const onResize = () => {
      syncTokenSize()
      placeAll((performance.now() - start) / 1000)
    }
    window.addEventListener('resize', onResize)
    frameRef.current = requestAnimationFrame(tick)

    const onMotionChange = () => {
      cancelAnimationFrame(frameRef.current)
      syncTokenSize()
      placeAll(0)
      if (!reducedMotion.matches) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }
    reducedMotion.addEventListener('change', onMotionChange)

    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', onResize)
      reducedMotion.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <div className={styles.pin} ref={pinRef}>
      <div className={styles.sticky}>
        <figure className={styles.stage} ref={stageRef} aria-hidden>
          <svg
            ref={svgRef}
            className={styles.svg}
            viewBox={VIEWBOX}
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
          >
            <defs>
              {RINGS.map((ring, i) => (
                <linearGradient
                  key={`g-${i}`}
                  id={`usdcRingGrad-${uid}-${i}`}
                  x1={ring.x1}
                  y1={ring.y1}
                  x2={ring.x1}
                  y2={ring.y2}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor={GEM.lavender} />
                  <stop offset="0.476" stopColor={GEM.rose} />
                  <stop offset="1" stopColor={GEM.amber} />
                </linearGradient>
              ))}
              <linearGradient
                id={`usdcCenterGrad-${uid}`}
                x1={CX}
                y1={1017.77}
                x2={CX}
                y2={1876.16}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor={GEM.lavender} />
                <stop offset="0.524" stopColor={GEM.rose} />
                <stop offset="1" stopColor={GEM.amber} />
              </linearGradient>
            </defs>

            {RINGS.map((ring, i) => (
              <circle
                key={i}
                cx={CX}
                cy={CY}
                r={ring.r}
                fill="none"
                stroke={`url(#usdcRingGrad-${uid}-${i})`}
                strokeWidth={STROKE}
                transform={
                  ring.rotate != null
                    ? `rotate(${ring.rotate} ${CX} ${CY})`
                    : undefined
                }
              />
            ))}

            <circle
              cx={CX}
              cy={CY}
              r={CENTER_R}
              fill={`url(#usdcCenterGrad-${uid})`}
            />
          </svg>

          {TRAVELERS.map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                travelerRefs.current[i] = el
              }}
              className={styles.traveler}
            >
              <TokenUSDC size={tokenSize} variant="branded" className={styles.travelerToken} />
            </div>
          ))}
        </figure>

        <div className={styles.wash} ref={washRef} aria-hidden />

        <section
          className={styles.copy}
          id="what-is-armada"
          aria-labelledby="integrators-heading"
        >
          <div className={`armada-site-stack ${styles.copyInner}`}>
            <h2 id="integrators-heading" className={`armada-text-title ${styles.copyTitle}`}>
              <span className={styles.titleLine}>{content.title[0]}</span>
              <span className={styles.titleLine}>{content.title[1]}</span>
            </h2>
            <p className={`armada-text-body ${styles.copyBody}`}>{content.body}</p>
            <div className={styles.ctaRow}>
              {content.ctas.map((cta) => (
                <Button
                  key={cta.label}
                  variant={cta.variant === 'ghost' ? 'ghost' : cta.variant}
                  size="lg"
                  label={cta.label}
                  showIcon={false}
                  href={cta.href}
                  {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
