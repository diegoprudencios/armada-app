import { useEffect, useState } from 'react'
import { DepositProcessingStepper } from '@/components/DepositProcessingStepper'
import { scheduleTxProcessingDemo } from '@/constants/txProcessingTiming'
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
  onComplete,
  onViewExplorer,
  onGoToDashboard,
}: DepositProcessingScreenProps) {
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

  return (
    <div className={styles.column}>
      <DepositProcessingStepper activeStageIndex={activeStageIndex} completed={completed} />
    </div>
  )
}
