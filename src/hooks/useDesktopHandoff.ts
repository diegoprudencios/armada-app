import { useEffect, useState } from 'react'
import { MOBILE_LAYOUT_MAX_WIDTH_PX } from '@/constants/viewportBreakpoints'

/** Pair with `@media (max-width: 767px)` — desktop handoff is the next pixel up. */
const DESKTOP_HANDOFF_QUERY = `(min-width: ${MOBILE_LAYOUT_MAX_WIDTH_PX + 1}px)`

/**
 * Desktop-only sticky / pin handoff. When `enabled` is false, always inactive
 * (mobile is a normal scroll, even on a wide window).
 */
export function useDesktopHandoff(enabled: boolean): boolean {
  const [active, setActive] = useState(() =>
    enabled && typeof window !== 'undefined'
      ? window.matchMedia(DESKTOP_HANDOFF_QUERY).matches
      : false,
  )

  useEffect(() => {
    if (!enabled) {
      setActive(false)
      return
    }
    const mq = window.matchMedia(DESKTOP_HANDOFF_QUERY)
    const sync = () => setActive(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [enabled])

  return active
}
