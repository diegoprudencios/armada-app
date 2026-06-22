import { useEffect, useState } from 'react'
import { DepositProcessingStepper } from '@/components/DepositProcessingStepper'
import styles from './DepositProcessingScreen.module.css'

const DEMO_PROCESSING_MS = 8000
const STAGE_ADVANCE_MS = 2500

export interface DepositProcessingScreenProps {
  onCancel: () => void
  onComplete: () => void
}

export function DepositProcessingScreen({
  onCancel,
  onComplete,
}: DepositProcessingScreenProps) {
  const [activeStageIndex, setActiveStageIndex] = useState(0)

  useEffect(() => {
    const stageTimers = [
      window.setTimeout(() => setActiveStageIndex(1), STAGE_ADVANCE_MS),
      window.setTimeout(() => setActiveStageIndex(2), STAGE_ADVANCE_MS * 2),
    ]
    const completeTimer = window.setTimeout(onComplete, DEMO_PROCESSING_MS)
    return () => {
      stageTimers.forEach(window.clearTimeout)
      window.clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className={styles.column}>
      <DepositProcessingStepper
        activeStageIndex={activeStageIndex}
        onCancel={onCancel}
      />
    </div>
  )
}
