import { useCallback, useEffect, useRef, useState } from 'react'
import type { DepositChainId } from '@/constants/depositChains'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { DepositAmountScreen } from './DepositAmountScreen'
import { DepositProcessingScreen } from './DepositProcessingScreen'
import { DepositReviewScreen } from './DepositReviewScreen'
import { DepositWalletApproveScreen } from './DepositWalletApproveScreen'
import {
  DEPOSIT_PROGRESS_STEPS,
  DEPOSIT_WALLET_BALANCE,
  networkDisplayName,
} from './depositFlowConstants'

export type DepositModalStep = 'amount' | 'review' | 'wallet' | 'processing' | 'confirmed'

const DEPOSIT_STEP_NUMBER: Record<DepositModalStep, number> = {
  amount: 1,
  review: 2,
  wallet: 3,
  processing: 4,
  confirmed: 4,
}

export interface DepositModalFlowProps {
  step: DepositModalStep
  amount: string
  chain: DepositChainId
  depositWalletBalance?: number
  walletAddress?: string
  walletProvider?: string
  confirmedAt?: number | null
  onClose: () => void
  onAmountChange: (amount: string) => void
  onAmountReview: (amount: string, chain: DepositChainId) => void
  onReviewBack: () => void
  onReviewConfirm: () => void
  onWalletComplete: () => void
  onWalletCancel: () => void
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
  confirmedAt,
  onClose,
  onAmountChange,
  onAmountReview,
  onReviewBack,
  onReviewConfirm,
  onWalletComplete,
  onWalletCancel,
  onProcessingComplete,
  onConfirmedViewExplorer,
  onConfirmedGoToDashboard,
}: DepositModalFlowProps) {
  const [exiting, setExiting] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const isConfirmStep = step === 'processing' || step === 'confirmed'
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
            networkName={networkDisplayName(chain)}
            walletAddress={walletAddress}
            onComplete={onWalletComplete}
            onCancel={onWalletCancel}
          />
        )
      case 'processing':
      case 'confirmed':
        return (
          <DepositProcessingScreen
            amount={amount}
            networkName={networkDisplayName(chain)}
            walletAddress={walletAddress}
            walletProvider={walletProvider}
            confirmedAt={confirmedAt ?? Date.now()}
            confirmed={isConfirmed}
            onComplete={onProcessingComplete}
            onViewExplorer={onConfirmedViewExplorer}
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

  return (
    <FlowModalOverlay
      label="Deposit"
      exiting={exiting}
      onClose={requestClose}
      initialFocusRef={closeButtonRef}
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={[...DEPOSIT_PROGRESS_STEPS]}
        currentStep={DEPOSIT_STEP_NUMBER[step]}
        status={isConfirmed ? 'confirmed' : 'default'}
        flowLabel="Deposit"
        exiting={exiting}
        onClose={requestClose}
        closeButtonRef={closeButtonRef}
      >
        <div key={isConfirmStep ? 'confirm' : step} className={modalStepShell}>
          {renderStep()}
        </div>
      </ModalShell>
    </FlowModalOverlay>
  )
}
