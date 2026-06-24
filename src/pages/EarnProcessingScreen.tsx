import { useEffect, useState } from 'react'
import { EarnProcessingStepper } from '@/components/EarnProcessingStepper/EarnProcessingStepper'
import { EarnConfirmedScreen } from '@/pages/EarnConfirmedScreen'
import type { EarnTab } from '@/pages/earnFlowConstants'
import styles from './EarnProcessingScreen.module.css'

const DEMO_PROCESSING_MS = 8000
const STAGE_ADVANCE_MS = 2500

export interface EarnProcessingScreenProps {
  tab: EarnTab
  amount: string
  confirmedAt: number
  confirmed?: boolean
  onCancel: () => void
  onComplete: () => void
  onViewExplorer?: () => void
  onGoToDashboard: () => void
}

export function EarnProcessingScreen({
  tab,
  amount,
  confirmedAt,
  confirmed = false,
  onCancel,
  onComplete,
  onViewExplorer,
  onGoToDashboard,
}: EarnProcessingScreenProps) {
  const [activeStageIndex, setActiveStageIndex] = useState(0)

  useEffect(() => {
    if (confirmed) return

    const stageTimers = [
      window.setTimeout(() => setActiveStageIndex(1), STAGE_ADVANCE_MS),
      window.setTimeout(() => setActiveStageIndex(2), STAGE_ADVANCE_MS * 2),
    ]
    const completeTimer = window.setTimeout(onComplete, DEMO_PROCESSING_MS)
    return () => {
      stageTimers.forEach(window.clearTimeout)
      window.clearTimeout(completeTimer)
    }
  }, [confirmed, onComplete])

  if (confirmed) {
    return (
      <EarnConfirmedScreen
        tab={tab}
        amount={amount}
        confirmedAt={confirmedAt}
        onViewExplorer={onViewExplorer ?? (() => undefined)}
        onGoToDashboard={onGoToDashboard}
      />
    )
  }

  return (
    <div className={styles.column}>
      <EarnProcessingStepper tab={tab} activeStageIndex={activeStageIndex} onCancel={onCancel} />
    </div>
  )
}
