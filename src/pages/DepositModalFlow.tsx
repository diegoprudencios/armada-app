import { useCallback, useEffect, useRef, useState } from 'react'
import type { DepositChainId } from '@/components/DepositAmountCard'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { DepositAmountScreen } from './DepositAmountScreen'
import { DepositConfirmedScreen } from './DepositConfirmedScreen'
import { DepositProcessingScreen } from './DepositProcessingScreen'
import { DepositReviewScreen } from './DepositReviewScreen'
import { DepositWalletApproveScreen } from './DepositWalletApproveScreen'
import {
  DEPOSIT_PROGRESS_STEPS,
  DEPOSIT_WALLET_BALANCE,
  networkDisplayName,
} from './depositFlowConstants'
import styles from './DepositModalFlow.module.css'

export type DepositModalStep = 'amount' | 'review' | 'wallet' | 'processing' | 'confirmed'

const DEPOSIT_STEP_NUMBER: Record<DepositModalStep, number> = {
  amount: 1,
  review: 2,
  wallet: 3,
  processing: 4,
  confirmed: 5,
}

export interface DepositModalFlowProps {
  step: DepositModalStep
  amount: string
  chain: DepositChainId
  depositWalletBalance?: number
  walletAddress?: string
  walletProvider?: string
  onClose: () => void
  onAmountChange: (amount: string) => void
  onAmountReview: (amount: string, chain: DepositChainId) => void
  onReviewBack: () => void
  onReviewConfirm: () => void
  onWalletComplete: () => void
  onProcessingCancel: () => void
  onProcessingComplete: () => void
  onConfirmedViewExplorer?: () => void
  onConfirmedGoToDashboard: () => void
}

export function DepositModalFlow({
  step,
  amount,
  chain,
  depositWalletBalance = Number(DEPOSIT_WALLET_BALANCE),
  walletAddress,
  walletProvider,
  onClose,
  onAmountChange,
  onAmountReview,
  onReviewBack,
  onReviewConfirm,
  onWalletComplete,
  onProcessingCancel,
  onProcessingComplete,
  onConfirmedViewExplorer,
  onConfirmedGoToDashboard,
}: DepositModalFlowProps) {
  const [exiting, setExiting] = useState(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const isConfirmed = step === 'confirmed'

  const requestClose = useCallback(() => {
    setExiting((current) => (current ? current : true))
  }, [])

  useEffect(() => {
    if (!exiting) return
    const timer = window.setTimeout(() => onCloseRef.current(), MODAL_EXIT_TOTAL_MS)
    return () => window.clearTimeout(timer)
  }, [exiting])

  function handleConfirmedGoToDashboard() {
    onConfirmedGoToDashboard()
    requestClose()
  }

  function renderStep() {
    switch (step) {
      case 'review':
        return (
          <DepositReviewScreen
            amount={amount}
            networkName={networkDisplayName(chain)}
            walletAddress={walletAddress}
            walletProvider={walletProvider}
            onBack={onReviewBack}
            onConfirm={onReviewConfirm}
          />
        )
      case 'wallet':
        return (
          <DepositWalletApproveScreen
            amount={amount}
            onComplete={onWalletComplete}
          />
        )
      case 'processing':
        return (
          <DepositProcessingScreen
            onCancel={onProcessingCancel}
            onComplete={onProcessingComplete}
          />
        )
      case 'confirmed':
        return (
          <DepositConfirmedScreen
            amount={amount}
            onViewExplorer={onConfirmedViewExplorer ?? (() => undefined)}
            onGoToDashboard={handleConfirmedGoToDashboard}
          />
        )
      default:
        return (
          <DepositAmountScreen
            balance={depositWalletBalance}
            amount={amount}
            chain={chain}
            onAmountChange={onAmountChange}
            onCancel={requestClose}
            onReview={onAmountReview}
          />
        )
    }
  }

  const overlayClassName = [styles.overlay, exiting && styles.overlayExiting].filter(Boolean).join(' ')

  return (
    <div
      className={overlayClassName}
      role="presentation"
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={[...DEPOSIT_PROGRESS_STEPS]}
        currentStep={DEPOSIT_STEP_NUMBER[step]}
        status={isConfirmed ? 'confirmed' : 'default'}
        flowLabel="Deposit"
        contentOffset={isConfirmed ? 'confirmation' : 'default'}
        exiting={exiting}
        onClose={requestClose}
      >
        <div key={step} className={modalStepShell}>
          {renderStep()}
        </div>
      </ModalShell>
    </div>
  )
}
