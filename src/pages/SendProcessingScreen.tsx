import { useEffect, useState } from 'react'
import { SendProcessingStepper } from '@/components/SendProcessingStepper'
import {
  scheduleTxProcessingDemo,
  DEPOSIT_PROCESSING_STAGE_ADVANCE_MS,
  DEPOSIT_PROCESSING_COMPLETED_HOLD_MS,
} from '@/constants/txProcessingTiming'
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
  /** Family mobile keypad: full-bleed gradient processing layout. */
  familyMobileLayout?: boolean
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
  familyMobileLayout = false,
  onComplete,
  onViewExplorer,
  onGoToDashboard,
}: SendProcessingScreenProps) {
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (confirmed) return

    return scheduleTxProcessingDemo(
      {
        onStageChange: setActiveStageIndex,
        onCompleted: () => setCompleted(true),
        onComplete,
      },
      {
        stageAdvanceMs: DEPOSIT_PROCESSING_STAGE_ADVANCE_MS,
        completedHoldMs: DEPOSIT_PROCESSING_COMPLETED_HOLD_MS,
      },
    )
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

  const rootClassName = [styles.column, familyMobileLayout && styles.columnImmersive]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClassName}>
      <SendProcessingStepper
        activeStageIndex={activeStageIndex}
        completed={completed}
        variant={variant}
        recipient={recipient}
        layout={familyMobileLayout ? 'immersive' : 'default'}
      />
    </div>
  )
}
