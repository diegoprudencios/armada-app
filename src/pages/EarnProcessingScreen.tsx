import { useEffect, useState } from 'react'
import { EarnProcessingStepper } from '@/components/EarnProcessingStepper/EarnProcessingStepper'
import { scheduleTxProcessingDemo } from '@/constants/txProcessingTiming'
import { EarnConfirmedScreen } from '@/pages/EarnConfirmedScreen'
import type { EarnTab } from '@/pages/earnFlowConstants'
import styles from './EarnProcessingScreen.module.css'

export interface EarnProcessingScreenProps {
  tab: EarnTab
  amount: string
  confirmedAt: number
  confirmed?: boolean
  onComplete: () => void
  onViewExplorer?: () => void
  onGoToDashboard: () => void
}

export function EarnProcessingScreen({
  tab,
  amount,
  confirmedAt,
  confirmed = false,
  onComplete,
  onViewExplorer,
  onGoToDashboard,
}: EarnProcessingScreenProps) {
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (confirmed) return

    return scheduleTxProcessingDemo({
      onStageChange: setActiveStageIndex,
      onCompleted: () => setCompleted(true),
      onComplete,
    })
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
      <EarnProcessingStepper tab={tab} activeStageIndex={activeStageIndex} completed={completed} />
    </div>
  )
}
