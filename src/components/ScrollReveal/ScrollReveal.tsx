import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import styles from './ScrollReveal.module.css'

export type RevealMotion = 'slide' | 'fade'

type RevealOptions = {
  motion?: RevealMotion
  /** Reveal on mount — no IntersectionObserver wait (e.g. hero USDC on mobile). */
  immediate?: boolean
}

/**
 * Scroll-triggered cascade for a text block’s direct children
 * (title → body → CTA).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  motion = 'slide',
  immediate = false,
}: RevealOptions = {}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const reveal = () => {
      root.classList.add(styles.isVisible)
    }

    if (reducedMotion.matches || immediate) {
      requestAnimationFrame(() => {
        requestAnimationFrame(reveal)
      })
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
      motion === 'fade'
        ? {
            // Fire as soon as the centered block enters the viewport.
            threshold: 0,
            rootMargin: '20% 0px 0px 0px',
          }
        : {
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
  }, [motion, immediate])

  return {
    ref,
    className: motion === 'fade' ? styles.stackFade : styles.stack,
  }
}

type RevealStackProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  /** `slide` = translate up (default); `fade` = opacity only, earlier trigger. */
  motion?: RevealMotion
  /** Skip scroll wait — reveal as soon as mounted. */
  immediate?: boolean
}

/** Stack root that cascades direct children on scroll entry. */
export function RevealStack({
  children,
  className,
  motion = 'slide',
  immediate = false,
  ...rest
}: RevealStackProps) {
  const reveal = useScrollReveal({ motion, immediate })
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
