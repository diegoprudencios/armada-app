import { useEffect, useRef } from 'react'
import { EyeSlashIcon } from '@heroicons/react/24/outline'
import { ComplianceDocCheckIcon } from './ComplianceDocCheckIcon'
import styles from './ComplianceToggleStack.module.css'

/** Figma compliance toggle — design sizes at scale 1 (JS fits to the diagram column). */
const TOGGLE_WIDTH_PX = 345
const TOGGLE_HEIGHT_PX = 170
const STACK_INDENT_PX = 150
const TOGGLE_GAP_PX = 28
const TOGGLE_COUNT = 6
const DESIGN_TOTAL_W = TOGGLE_WIDTH_PX + STACK_INDENT_PX

/** ~1.35px/frame at 60fps — frame-rate independent. */
const BASE_SPEED_PX_PER_SEC = 1.35 * 60
/** Maps scroll velocity (px/ms) into boost added per scroll event. */
const SCROLL_VELOCITY_GAIN = 0.45
const SCROLL_MAX_BOOST = 4
/** Per-frame decay at 60fps; applied with Math.pow(..., dt*60). */
const SCROLL_DECAY_PER_FRAME_60 = 0.92

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
 * Each toggle flips on (gradient + shield) as it crosses the viewport midline.
 * Scroll boosts travel speed. Motion is delta-timed (same speed on 60/120Hz).
 * Size fits the diagram column via ResizeObserver; dial --compliance-anim-scale in CSS.
 */
export function ComplianceToggleStack() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const toggleRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const viewport = viewportRef.current
    const rail = railRef.current
    if (!viewport || !rail) return

    const host = viewport.parentElement
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fallbackStride = TOGGLE_HEIGHT_PX + TOGGLE_GAP_PX

    let frameId = 0
    let disposed = false
    let offset = 0
    let scrollBoost = 0
    let lastScrollY = window.scrollY
    let lastScrollTs = performance.now()
    let lastFrameTs = performance.now()

    const toggles = toggleRefs.current.filter(Boolean) as HTMLDivElement[]

    const measureLoopHeight = () => {
      const first = toggles[0]
      const second = toggles[TOGGLE_COUNT]
      if (!first || !second) return TOGGLE_COUNT * fallbackStride
      return second.offsetTop - first.offsetTop
    }

    let loopHeight = measureLoopHeight()

    const applyFitScale = () => {
      if (!host) return
      const available = host.clientWidth
      if (available <= 0) return
      const fit = Math.min(1, available / DESIGN_TOTAL_W)
      const manual =
        Number.parseFloat(
          getComputedStyle(viewport).getPropertyValue('--compliance-anim-scale').trim(),
        ) || 1
      viewport.style.setProperty('--s', String(fit * manual))
      loopHeight = measureLoopHeight()
      if (loopHeight > 0) offset = offset % loopHeight
    }

    const updateActiveStates = (instant: boolean) => {
      const midY = viewport.getBoundingClientRect().top + viewport.clientHeight / 2

      if (instant) {
        rail.classList.add(styles.noTransition)
      }

      for (const el of toggles) {
        const rect = el.getBoundingClientRect()
        const centerY = rect.top + rect.height / 2
        const on = centerY <= midY
        el.classList.toggle(styles.on, on)
        el.setAttribute('aria-checked', on ? 'true' : 'false')
      }

      if (instant) {
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

      const velocityPxPerMs = dy / dt
      scrollBoost = Math.min(
        SCROLL_MAX_BOOST,
        scrollBoost + velocityPxPerMs * SCROLL_VELOCITY_GAIN,
      )
    }

    const tick = (now: number) => {
      if (disposed) return

      const dtSec = Math.min(Math.max((now - lastFrameTs) / 1000, 0), 0.064)
      lastFrameTs = now
      let wrapped = false

      if (!reducedMotion.matches && dtSec > 0) {
        scrollBoost *= Math.pow(SCROLL_DECAY_PER_FRAME_60, dtSec * 60)
        if (scrollBoost < 0.02) scrollBoost = 0

        const layoutScale =
          toggles[0] && toggles[0].offsetHeight > 0
            ? toggles[0].offsetHeight / TOGGLE_HEIGHT_PX
            : 1
        const speed = BASE_SPEED_PX_PER_SEC * layoutScale * (1 + scrollBoost)
        offset += speed * dtSec
        if (loopHeight > 0 && offset >= loopHeight) {
          offset -= loopHeight
          wrapped = true
        }
        rail.style.transform = `translate3d(0, ${-offset}px, 0)`
      }

      updateActiveStates(wrapped)
      frameId = window.requestAnimationFrame(tick)
    }

    applyFitScale()
    const resizeObserver =
      host && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            applyFitScale()
            updateActiveStates(true)
          })
        : null
    if (host && resizeObserver) {
      resizeObserver.observe(host)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateActiveStates(true)
    frameId = window.requestAnimationFrame(tick)

    return () => {
      disposed = true
      resizeObserver?.disconnect()
      window.removeEventListener('scroll', onScroll)
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
                <EyeSlashIcon
                  className={`${styles.icon} ${styles.iconOutline} ${styles.iconPrivate}`}
                  aria-hidden
                />
                <ComplianceDocCheckIcon
                  className={`${styles.icon} ${styles.iconCompliance}`}
                />
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
