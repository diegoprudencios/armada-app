import { useEffect, useRef } from 'react'
import { EyeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import styles from './ComplianceToggleStack.module.css'

/** Figma compliance toggle — no exact spacing tokens for these sizes. */
const TOGGLE_WIDTH_PX = 345
const TOGGLE_HEIGHT_PX = 170
const STACK_INDENT_PX = 150
const TOGGLE_GAP_PX = 28
const TOGGLE_COUNT = 6

const BASE_SPEED_PX = 1.35
/** Maps scroll velocity (px/ms) into boost added per scroll event. */
const SCROLL_VELOCITY_GAIN = 0.45
const SCROLL_MAX_BOOST = 4
const SCROLL_DECAY = 0.92

type ToggleItem = {
  id: number
  indent: boolean
}

function buildItems(): ToggleItem[] {
  return Array.from({ length: TOGGLE_COUNT }, (_, i) => ({
    id: i,
    indent: i % 2 === 1,
  }))
}

/**
 * Infinite stack of compliance toggles rising bottom→top.
 * Crossing the viewport midline flips each toggle on (gradient + shield).
 * Scroll boosts travel speed (same idea as PrivacySphere spin).
 */
export function ComplianceToggleStack() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const toggleRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const viewport = viewportRef.current
    const rail = railRef.current
    if (!viewport || !rail) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fallbackStride = TOGGLE_HEIGHT_PX + TOGGLE_GAP_PX

    let frameId = 0
    let disposed = false
    let offset = 0
    let scrollBoost = 0
    let lastScrollY = window.scrollY
    let lastScrollTs = performance.now()

    const toggles = toggleRefs.current.filter(Boolean) as HTMLDivElement[]

    const measureLoopHeight = () => {
      const first = toggles[0]
      const second = toggles[TOGGLE_COUNT]
      if (!first || !second) return TOGGLE_COUNT * fallbackStride
      return second.offsetTop - first.offsetTop
    }

    let loopHeight = measureLoopHeight()

    const setActiveInstant = (el: HTMLDivElement, on: boolean) => {
      el.classList.toggle(styles.on, on)
      el.setAttribute('aria-checked', on ? 'true' : 'false')
    }

    const updateActiveStates = (instant: boolean) => {
      const midY = viewport.getBoundingClientRect().top + viewport.clientHeight / 2

      if (instant) {
        rail.classList.add(styles.noTransition)
      }

      for (const el of toggles) {
        const rect = el.getBoundingClientRect()
        const centerY = rect.top + rect.height / 2
        setActiveInstant(el, centerY <= midY)
      }

      if (instant) {
        /* Flush styles so the snap applies before transitions turn back on. */
        void rail.offsetHeight
        rail.classList.remove(styles.noTransition)
      }
    }

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
        SCROLL_MAX_BOOST,
        scrollBoost + velocityPxPerMs * SCROLL_VELOCITY_GAIN,
      )
    }

    const onResize = () => {
      loopHeight = measureLoopHeight()
      if (loopHeight > 0) offset = offset % loopHeight
    }

    const tick = () => {
      if (disposed) return

      let wrapped = false

      if (!reducedMotion.matches) {
        scrollBoost *= SCROLL_DECAY
        if (scrollBoost < 0.02) scrollBoost = 0
        const speed = BASE_SPEED_PX * (1 + scrollBoost)
        offset += speed
        if (loopHeight > 0 && offset >= loopHeight) {
          offset -= loopHeight
          wrapped = true
        }
        rail.style.transform = `translate3d(0, ${-offset}px, 0)`
      }

      updateActiveStates(wrapped)
      frameId = window.requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    updateActiveStates(true)
    frameId = window.requestAnimationFrame(tick)

    return () => {
      disposed = true
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  const items = buildItems()
  /* Two copies for a seamless vertical loop. */
  const loopItems = [...items, ...items]

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      role="group"
      aria-label="Compliance toggles switching from private to disclosed as they rise"
    >
      <div ref={railRef} className={styles.rail}>
        {loopItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            ref={(el) => {
              toggleRefs.current[index] = el
            }}
            className={`${styles.toggle} ${item.indent ? styles.indent : ''}`}
            role="switch"
            aria-checked="false"
            aria-hidden={index >= TOGGLE_COUNT ? true : undefined}
          >
            <div className={styles.thumb}>
              <span className={styles.iconClip}>
                <EyeIcon className={`${styles.icon} ${styles.iconEye}`} aria-hidden />
                <ShieldCheckIcon className={`${styles.icon} ${styles.iconShield}`} aria-hidden />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Re-export sizes kept for docs / future layout helpers. */
export const COMPLIANCE_TOGGLE_LAYOUT = {
  width: TOGGLE_WIDTH_PX,
  height: TOGGLE_HEIGHT_PX,
  indent: STACK_INDENT_PX,
  gap: TOGGLE_GAP_PX,
} as const
