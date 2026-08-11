import { useEffect, useRef, useState } from 'react'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { useGlobeScene, type GlobeMode, type GlobeSceneApi } from './useGlobeScene'
import styles from './GlobeStory.module.css'

type Chapter = {
  id: string
  mode: GlobeMode
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
}

const CHAPTERS: Chapter[] = [
  {
    id: 'privacy',
    mode: 'privacy',
    title: "Privacy your users don't have to think about",
    body: 'Add shielded USDC to your product with the SDK, APIs, and compliance tooling.',
    ctaLabel: 'Integrate and test',
    ctaHref: 'https://docs.armada.blue',
  },
  {
    id: 'capital-in-motion',
    mode: 'capital',
    title: 'Protecting capital in motion',
    body: 'Shield your relationships: balances, counterparties, allocation activity, and transaction history while continuing to operate with USDC.',
    ctaLabel: 'Integrate and test',
    ctaHref: 'https://docs.armada.blue',
  },
]

const TRAVEL_DURATION_MS = 5600
const TRAVEL_PAUSE_MS = 900
/**
 * Scroll phases (pin progress 0→1):
 * 1) Blur USDCs while privacy copy stays centered
 * 2) Then copy scrolls; mode switches when capital hits mid
 */
const BLUR_END_AT = 0.42
const MODE_SWITCH_AT = 0.72
/** Two-slot track: -50% moves privacy → capital into center. */
const COPY_TRACK_SHIFT_MAX = 50

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function CapitalPipe({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const travelerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    const root = rootRef.current
    const path = pathRef.current
    const traveler = travelerRef.current
    if (!root || !path || !traveler) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let start = performance.now()
    let pathLength = path.getTotalLength()

    const layout = () => {
      const w = root.clientWidth
      const h = root.clientHeight
      const midY = h / 2
      path.setAttribute('d', `M 0 ${midY} L ${w} ${midY}`)
      pathLength = path.getTotalLength()
    }

    const resizeObserver = new ResizeObserver(layout)
    resizeObserver.observe(root)
    layout()

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (reducedMotion.matches || pathLength < 1) {
        traveler.style.opacity = '0'
        return
      }

      const cycle = TRAVEL_DURATION_MS + TRAVEL_PAUSE_MS
      const elapsed = (now - start) % cycle
      if (elapsed >= TRAVEL_DURATION_MS) {
        traveler.style.opacity = '0'
        return
      }

      const t = elapsed / TRAVEL_DURATION_MS
      const point = path.getPointAtLength(t * pathLength)
      const sphereLeft = root.clientWidth * 0.32
      const sphereRight = root.clientWidth * 0.68
      const inside = point.x > sphereLeft && point.x < sphereRight
      const edge = Math.min(
        1,
        Math.abs(point.x - (sphereLeft + sphereRight) / 2) / ((sphereRight - sphereLeft) / 2),
      )
      const blurPx = inside ? 7 * (1 - edge * 0.35) : 0

      traveler.style.opacity = '1'
      traveler.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`
      traveler.style.filter = blurPx > 0.2 ? `blur(${blurPx}px)` : 'none'
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
    }
  }, [active])

  return (
    <div
      ref={rootRef}
      className={styles.pipeStage}
      data-active={active ? 'true' : 'false'}
      aria-hidden
    >
      <svg className={styles.pipeSvg}>
        <path className={styles.pipeGuide} ref={pathRef} d="M 0 50 L 100 50" />
        <line className={styles.pipeLine} x1="0" y1="48%" x2="100%" y2="48%" />
        <line className={styles.pipeLine} x1="0" y1="52%" x2="100%" y2="52%" />
      </svg>
      <div ref={travelerRef} className={styles.traveler}>
        <TokenUSDC className={styles.travelerToken} variant="branded" />
      </div>
    </div>
  )
}

export function GlobeStory() {
  const pinRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<GlobeSceneApi | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [copyProgress, setCopyProgress] = useState(0)

  useGlobeScene(canvasHostRef, apiRef)

  useEffect(() => {
    const pin = pinRef.current
    if (!pin) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = () => {
      const rect = pin.getBoundingClientRect()
      const travel = Math.max(1, pin.offsetHeight - window.innerHeight)
      const progress = clamp01(-rect.top / travel)

      // Phase 1: blur only. Phase 2: copy scrolls privacy → capital.
      const copy =
        reducedMotion.matches
          ? progress < MODE_SWITCH_AT
            ? 0
            : 1
          : progress <= BLUR_END_AT
            ? 0
            : clamp01((progress - BLUR_END_AT) / (1 - BLUR_END_AT))
      setCopyProgress(copy)

      const index = progress < MODE_SWITCH_AT ? 0 : 1
      setActiveIndex(index)

      const chapter = CHAPTERS[index]
      apiRef.current?.setMode(chapter.mode)

      if (chapter.mode === 'privacy') {
        const local = reducedMotion.matches ? 1 : clamp01(progress / BLUR_END_AT)
        apiRef.current?.setBlur(local)
      }
    }

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        update()
      })
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const activeMode = CHAPTERS[activeIndex]?.mode ?? 'privacy'
  const copyTransform = `translate3d(0, ${-copyProgress * COPY_TRACK_SHIFT_MAX}%, 0)`

  return (
    <section className={styles.pin} ref={pinRef} aria-label="Armada privacy story">
      <div className={styles.sticky}>
        <div className={styles.split}>
          <div className={styles.copyColumn}>
            <div className={styles.copyTrack} style={{ transform: copyTransform }}>
              {CHAPTERS.map((chapter, index) => {
                const isActive = index === activeIndex
                return (
                  <article
                    key={chapter.id}
                    id={chapter.id}
                    className={styles.chapter}
                    data-active={isActive ? 'true' : 'false'}
                    aria-labelledby={`${chapter.id}-heading`}
                    aria-hidden={!isActive}
                  >
                    <div className={`armada-site-stack ${styles.chapterInner}`}>
                      <h2
                        id={`${chapter.id}-heading`}
                        className={`armada-text-title ${styles.chapterTitle}`}
                      >
                        {chapter.title}
                      </h2>
                      <p className={`armada-text-body ${styles.chapterBody}`}>{chapter.body}</p>
                      <Button
                        variant="primary"
                        size="lg"
                        label={chapter.ctaLabel}
                        showIcon={false}
                        href={chapter.ctaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          <div className={styles.stageColumn} aria-hidden>
            <div className={styles.stage}>
              <div
                ref={canvasHostRef}
                className={styles.canvasHost}
                style={{ ['--diagram-stroke' as string]: '#5a4a62' }}
              />
              <CapitalPipe active={activeMode === 'capital'} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
