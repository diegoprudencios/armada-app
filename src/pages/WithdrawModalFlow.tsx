import { useCallback, useEffect, useRef, useState } from 'react'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { SendAmountScreen } from './SendAmountScreen'
import { SendProcessingScreen } from './SendProcessingScreen'
import { SendRecipientScreen } from './SendRecipientScreen'
import { SendReviewScreen } from './SendReviewScreen'
import { type SendChainId } from './sendFlowConstants'
import { WITHDRAW_PROGRESS_STEPS, type WithdrawModalStep } from './withdrawFlowConstants'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'

const WITHDRAW_STEP_NUMBER: Record<WithdrawModalStep, number> = {
  recipient: 1,
  amount: 2,
  review: 3,
  processing: 4,
  confirmed: 4,
}

export interface WithdrawModalFlowProps {
  step: WithdrawModalStep
  amount: string
  recipient: string
  chain: SendChainId
  armadaBalance: number
  armadaAddress?: string
  confirmedAt?: number | null
  onClose: () => void
  onRecipientChange: (recipient: string) => void
  onChainChange: (chain: SendChainId) => void
  onRecipientContinue: () => void
  onAmountChange: (amount: string) => void
  onAmountBack: () => void
  onAmountReview: (amount: string) => void
  onReviewBack: () => void
  onReviewConfirm: () => void
  onProcessingComplete: () => void
  onConfirmedViewExplorer?: () => void
  onConfirmedGoToDashboard: () => void
}

export function WithdrawModalFlow({
  step,
  amount,
  recipient,
  chain,
  armadaBalance,
  armadaAddress,
  confirmedAt,
  onClose,
  onRecipientChange,
  onChainChange,
  onRecipientContinue,
  onAmountChange,
  onAmountBack,
  onAmountReview,
  onReviewBack,
  onReviewConfirm,
  onProcessingComplete,
  onConfirmedViewExplorer,
  onConfirmedGoToDashboard,
}: WithdrawModalFlowProps) {
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
      case 'amount':
        return (
          <SendAmountScreen
            balance={armadaBalance}
            amount={amount}
            onAmountChange={onAmountChange}
            onBack={onAmountBack}
            onReview={onAmountReview}
          />
        )
      case 'review':
        return (
          <SendReviewScreen
            amount={amount}
            recipient={recipient}
            chain={chain}
            armadaAddress={armadaAddress ?? DEMO_ARMADA_ADDRESS}
            variant="withdraw"
            onBack={onReviewBack}
            onConfirm={onReviewConfirm}
          />
        )
      case 'processing':
      case 'confirmed':
        return (
          <SendProcessingScreen
            amount={amount}
            recipient={recipient}
            chain={chain}
            armadaAddress={armadaAddress ?? DEMO_ARMADA_ADDRESS}
            confirmedAt={confirmedAt ?? Date.now()}
            confirmed={isConfirmed}
            variant="withdraw"
            onComplete={onProcessingComplete}
            onViewExplorer={onConfirmedViewExplorer}
            onGoToDashboard={handleConfirmedGoToDashboard}
          />
        )
      default:
        return (
          <SendRecipientScreen
            recipient={recipient}
            chain={chain}
            variant="withdraw"
            showRecentAddresses={false}
            onRecipientChange={onRecipientChange}
            onChainChange={onChainChange}
            onContinue={onRecipientContinue}
          />
        )
    }
  }

  return (
    <FlowModalOverlay
      label="Withdraw"
      exiting={exiting}
      onClose={requestClose}
      initialFocusRef={closeButtonRef}
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={[...WITHDRAW_PROGRESS_STEPS]}
        currentStep={WITHDRAW_STEP_NUMBER[step]}
        status={isConfirmed ? 'confirmed' : 'default'}
        flowLabel="Withdraw"
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
