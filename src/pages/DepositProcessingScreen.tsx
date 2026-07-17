import { useEffect, useState } from 'react'
import { DepositProcessingStepper } from '@/components/DepositProcessingStepper'
import { scheduleTxProcessingDemo, DEPOSIT_PROCESSING_STAGE_ADVANCE_MS, DEPOSIT_PROCESSING_COMPLETED_HOLD_MS } from '@/constants/txProcessingTiming'
import { DepositConfirmedScreen } from '@/pages/DepositConfirmedScreen'
import styles from './DepositProcessingScreen.module.css'

export interface DepositProcessingScreenProps {
  amount: string
  networkName: string
  walletAddress?: string
  walletProvider?: string
  armadaAddress?: string
  confirmedAt: number
  confirmed?: boolean
  /** Mobile keypad: full-bleed gradient processing layout. */
  keypadMobileLayout?: boolean
  onComplete: () => void
  onViewExplorer?: () => void
  onGoToDashboard: () => void
}

export function DepositProcessingScreen({
  amount,
  networkName,
  walletAddress,
  walletProvider,
  armadaAddress,
  confirmedAt,
  confirmed = false,
  keypadMobileLayout = false,
  onComplete,
  onViewExplorer,
  onGoToDashboard,
}: DepositProcessingScreenProps) {
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
      <DepositConfirmedScreen
        amount={amount}
        networkName={networkName}
        walletAddress={walletAddress}
        walletProvider={walletProvider}
        armadaAddress={armadaAddress}
        confirmedAt={confirmedAt}
        onViewExplorer={onViewExplorer ?? (() => undefined)}
        onGoToDashboard={onGoToDashboard}
      />
    )
  }

  const rootClassName = [styles.column, keypadMobileLayout && styles.columnImmersive]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClassName}>
      <DepositProcessingStepper
        activeStageIndex={activeStageIndex}
        completed={completed}
        layout={keypadMobileLayout ? 'immersive' : 'default'}
      />
    </div>
  )
}
