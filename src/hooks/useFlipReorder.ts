import { useLayoutEffect, useRef } from 'react'

const FLIP_MS = 280
const FLIP_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Animates children when their vertical order changes (FLIP technique). */
export function useFlipReorder(orderKey: string) {
  const containerRef = useRef<HTMLDivElement>(null)
  const positionsRef = useRef<Map<string, DOMRect>>(new Map())

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const children = Array.from(container.children) as HTMLElement[]
    const nextPositions = new Map<string, DOMRect>()
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    for (const child of children) {
      const id = child.dataset.flipId
      if (!id) continue
      nextPositions.set(id, child.getBoundingClientRect())
    }

    if (!prefersReducedMotion) {
      for (const child of children) {
        const id = child.dataset.flipId
        if (!id) continue

        const prev = positionsRef.current.get(id)
        const next = nextPositions.get(id)
        if (!prev || !next) continue

        const deltaY = prev.top - next.top
        if (Math.abs(deltaY) < 1) continue

        child.style.transform = `translateY(${deltaY}px)`
        child.style.transition = 'transform 0ms'

        requestAnimationFrame(() => {
          child.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASING}`
          child.style.transform = ''
        })
      }
    }

    positionsRef.current = nextPositions
  }, [orderKey])

  return containerRef
}
