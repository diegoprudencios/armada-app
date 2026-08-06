import { useRef } from 'react'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { useThreeScene } from './useThreeScene'
import styles from './PrivacySphere.module.css'

function DiagramArrow({ direction }: { direction: 'in' | 'out' }) {
  return (
    <svg
      className={styles.arrow}
      viewBox="0 0 48 12"
      fill="none"
      aria-hidden
      focusable="false"
    >
      {direction === 'in' ? (
        <path d="M1 6 H43 M38 1.5 L44.5 6 L38 10.5" className={styles.arrowStroke} />
      ) : (
        <path d="M1 6 H43 M38 1.5 L44.5 6 L38 10.5" className={styles.arrowStroke} />
      )}
    </svg>
  )
}

/**
 * Wallet → shielded pool → any address diagram with a rotating three.js
 * wireframe sphere, blurred asset cluster, and orbiting USDC sprites.
 */
export function PrivacySphere() {
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobileLayout()
  useThreeScene(canvasHostRef)

  return (
    <div
      className={styles.root}
      role="img"
      aria-label="Diagram: your wallet connects through Armada's private pool to any address, with USDC moving around a shielded sphere"
    >
      <div className={styles.labelBox}>Your wallet</div>
      <div className={styles.connector} aria-hidden>
        <DiagramArrow direction="in" />
      </div>

      <div
        ref={canvasHostRef}
        className={isMobile ? styles.canvasHostMobile : styles.canvasHost}
      />

      <div className={styles.connector} aria-hidden>
        <DiagramArrow direction="out" />
      </div>
      <div className={styles.labelBox}>Any address</div>
    </div>
  )
}
