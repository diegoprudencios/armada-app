import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import styles from './ScrollReveal.module.css'

/**
 * Scroll-triggered cascade for a text block’s direct children
 * (title → body → CTA).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const reveal = () => {
      root.classList.add(styles.isVisible)
    }

    if (reducedMotion.matches) {
      reveal()
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        // Let the initial hidden styles commit, then reveal (hero already on-screen).
        requestAnimationFrame(() => {
          requestAnimationFrame(reveal)
        })
        io.disconnect()
      },
      {
        // Wait until the block is well into view so the slide-up is on-screen.
        threshold: 0.35,
        rootMargin: '0px 0px -18% 0px',
      },
    )

    io.observe(root)

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        reveal()
        io.disconnect()
      }
    }
    reducedMotion.addEventListener('change', onMotionChange)

    return () => {
      io.disconnect()
      reducedMotion.removeEventListener('change', onMotionChange)
    }
  }, [])

  return { ref, className: styles.stack }
}

type RevealStackProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

/** Stack root that cascades direct children on scroll entry. */
export function RevealStack({ children, className, ...rest }: RevealStackProps) {
  const reveal = useScrollReveal()
  return (
    <div
      {...rest}
      ref={reveal.ref}
      className={[reveal.className, className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}
