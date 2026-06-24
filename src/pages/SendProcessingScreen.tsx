import { useEffect, useState } from 'react'
import { SendProcessingStepper } from '@/components/SendProcessingStepper'
import { SendConfirmedScreen } from '@/pages/SendConfirmedScreen'
import type { SendChainId } from './sendFlowConstants'
import styles from './SendProcessingScreen.module.css'

const DEMO_PROCESSING_MS = 8000
const STAGE_ADVANCE_MS = 2500

export interface SendProcessingScreenProps {
  amount: string
  recipient: string
  chain: SendChainId
  armadaAddress?: string
  confirmed?: boolean
  onCancel: () => void
  onComplete: () => void
  onViewExplorer?: () => void
  onGoToDashboard: () => void
}

export function SendProcessingScreen({
  amount,
  recipient,
  chain,
  armadaAddress,
  confirmed = false,
  onCancel,
  onComplete,
  onViewExplorer,
  onGoToDashboard,
}: SendProcessingScreenProps) {
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
      <SendConfirmedScreen
        amount={amount}
        recipient={recipient}
        chain={chain}
        armadaAddress={armadaAddress}
        onViewExplorer={onViewExplorer ?? (() => undefined)}
        onGoToDashboard={onGoToDashboard}
      />
    )
  }

  return (
    <div className={styles.column}>
      <SendProcessingStepper activeStageIndex={activeStageIndex} onCancel={onCancel} />
    </div>
  )
}
