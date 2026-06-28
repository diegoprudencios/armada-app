import { useEffect, useRef } from 'react'
import { useMobileLayout } from '@/hooks/useMobileLayout'

/** Scrolls activity into view when opened on mobile. */
export function useMobileDashboardCardStack(activityVisible: boolean) {
  const isMobile = useMobileLayout()
  const cardStackRef = useRef<HTMLDivElement>(null)
  const activitySlotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMobile || !activityVisible) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const frame = requestAnimationFrame(() => {
      activitySlotRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [isMobile, activityVisible])

  return { cardStackRef, activitySlotRef }
}
