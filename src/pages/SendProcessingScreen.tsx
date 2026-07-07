import { useEffect, useState } from 'react'
import { SendProcessingStepper } from '@/components/SendProcessingStepper'
import { scheduleTxProcessingDemo } from '@/constants/txProcessingTiming'
import { SendConfirmedScreen } from '@/pages/SendConfirmedScreen'
import type { SendChainId, SendFlowVariant } from './sendFlowConstants'
import styles from './SendProcessingScreen.module.css'

export interface SendProcessingScreenProps {
  amount: string
  recipient: string
  chain: SendChainId
  armadaAddress?: string
  confirmedAt: number
  confirmed?: boolean
  variant?: SendFlowVariant
  onComplete: () => void
  onViewExplorer?: () => void
  onGoToDashboard: () => void
}

export function SendProcessingScreen({
  amount,
  recipient,
  chain,
  armadaAddress,
  confirmedAt,
  confirmed = false,
  variant = 'send',
  onComplete,
  onViewExplorer,
  onGoToDashboard,
}: SendProcessingScreenProps) {
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
      <SendConfirmedScreen
        amount={amount}
        recipient={recipient}
        chain={chain}
        armadaAddress={armadaAddress}
        confirmedAt={confirmedAt}
        variant={variant}
        onViewExplorer={onViewExplorer ?? (() => undefined)}
        onGoToDashboard={onGoToDashboard}
      />
    )
  }

  return (
    <div className={styles.column}>
      <SendProcessingStepper
        activeStageIndex={activeStageIndex}
        completed={completed}
        variant={variant}
        recipient={recipient}
      />
    </div>
  )
}
