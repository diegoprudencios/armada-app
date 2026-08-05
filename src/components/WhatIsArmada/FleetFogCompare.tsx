import { useEffect, useRef } from 'react'
import fleetFog from '@/assets/fleet-fog.webp'
import fleetNoFog from '@/assets/fleet-no-fog.webp'
import styles from './FleetFogCompare.module.css'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Scroll-scrubbed fog reveal: fog underneath, clear on top with a mask
 * that expands left→right on scroll, plus a 1px split marker.
 */
export function FleetFogCompare() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let listening = false

    const scrub = () => {
      frame = 0
      if (reducedMotion.matches) {
        root.style.setProperty('--fog-progress', '0.4')
        return
      }

      const rect = root.getBoundingClientRect()
      const viewH = window.innerHeight
      // Full scroll-through of the figure (enter bottom → leave top)
      const travel = viewH + rect.height
      const passed = viewH - rect.top
      const raw = clamp(passed / travel, 0, 1)

      // Hold at start, finish early — active only in the middle of the travel.
      // (Scroll-linked; not a wall-clock delay.)
      const startAt = 0.22
      const endAt = 0.62
      const progress = clamp((raw - startAt) / (endAt - startAt), 0, 1)
      root.style.setProperty('--fog-progress', progress.toFixed(4))
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
    // In case the figure is already on screen at mount
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
    <figure
      ref={rootRef}
      className={styles.root}
      aria-label="Fleet scene clearing as you scroll"
    >
      <img
        className={styles.image}
        src={fleetFog}
        alt=""
        width={1502}
        height={592}
        decoding="async"
      />

      <div className={styles.clearLayer} aria-hidden>
        <img
          className={styles.image}
          src={fleetNoFog}
          alt=""
          width={1502}
          height={592}
          decoding="async"
        />
      </div>

      <div className={styles.split} aria-hidden>
        <span className={styles.splitLine} />
      </div>
    </figure>
  )
}
