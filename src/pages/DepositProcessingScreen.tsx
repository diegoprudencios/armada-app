import { useEffect, useState } from 'react'
import { DepositProcessingStepper } from '@/components/DepositProcessingStepper'
import { DepositConfirmedScreen } from '@/pages/DepositConfirmedScreen'
import styles from './DepositProcessingScreen.module.css'

const DEMO_PROCESSING_MS = 8000
const STAGE_ADVANCE_MS = 2500

export interface DepositProcessingScreenProps {
  amount: string
  networkName: string
  walletAddress?: string
  walletProvider?: string
  armadaAddress?: string
  confirmed?: boolean
  onCancel: () => void
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
  confirmed = false,
  onCancel,
  onComplete,
  onViewExplorer,
  onGoToDashboard,
}: DepositProcessingScreenProps) {
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
      <DepositConfirmedScreen
        amount={amount}
        networkName={networkName}
        walletAddress={walletAddress}
        walletProvider={walletProvider}
        armadaAddress={armadaAddress}
        onViewExplorer={onViewExplorer ?? (() => undefined)}
        onGoToDashboard={onGoToDashboard}
      />
    )
  }

  return (
    <div className={styles.column}>
      <DepositProcessingStepper activeStageIndex={activeStageIndex} onCancel={onCancel} />
    </div>
  )
}
