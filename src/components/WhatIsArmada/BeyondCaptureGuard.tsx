import { useRef } from 'react'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { useBeyondCaptureScene } from './useBeyondCaptureScene'
import styles from './BeyondCaptureGuard.module.css'

/**
 * Beyond-capture panel diagram: Armada mark wrapped in a sparse gem-gradient
 * particle shell that contracts on pointer proximity.
 */
export function BeyondCaptureGuard() {
  const canvasHostRef = useRef<HTMLDivElement>(null)
  useBeyondCaptureScene(canvasHostRef)

  return (
    <div className={styles.root} aria-hidden>
      <div ref={canvasHostRef} className={styles.canvasHost} />
      <div className={styles.mark}>
        <ArmadaLogo variant="mark" markTone="brand" className={styles.markSvg} />
      </div>
    </div>
  )
}
