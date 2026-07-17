import { useCallback, useEffect, useRef, useState } from 'react'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { EarnAmountScreen } from './EarnAmountScreen'
import { EarnProcessingScreen } from './EarnProcessingScreen'
import { EarnReviewScreen } from './EarnReviewScreen'
import { EARN_PROGRESS_STEPS, type EarnModalStep, type EarnTab } from './earnFlowConstants'

const EARN_STEP_NUMBER: Record<EarnModalStep, number> = {
  amount: 1,
  review: 2,
  processing: 3,
  confirmed: 3,
}

export interface EarnModalFlowProps {
  step: EarnModalStep
  tab: EarnTab
  amount: string
  sourceBalance: number
  confirmedAt?: number | null
  onClose: () => void
  onTabChange: (tab: EarnTab) => void
  onAmountChange: (amount: string) => void
  onAmountReview: (amount: string) => void
  onReviewBack: () => void
  onReviewConfirm: () => void
  onProcessingComplete: () => void
  onConfirmedViewExplorer?: () => void
  onConfirmedGoToDashboard: () => void
}

export function EarnModalFlow({
  step,
  tab,
  amount,
  sourceBalance,
  confirmedAt,
  onClose,
  onTabChange,
  onAmountChange,
  onAmountReview,
  onReviewBack,
  onReviewConfirm,
  onProcessingComplete,
  onConfirmedViewExplorer,
  onConfirmedGoToDashboard,
}: EarnModalFlowProps) {
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
          <EarnReviewScreen
            tab={tab}
            amount={amount}
            onBack={onReviewBack}
            onConfirm={onReviewConfirm}
          />
        )
      case 'processing':
      case 'confirmed':
        return (
          <EarnProcessingScreen
            tab={tab}
            amount={amount}
            confirmedAt={confirmedAt ?? Date.now()}
            confirmed={isConfirmed}
            onComplete={onProcessingComplete}
            onViewExplorer={onConfirmedViewExplorer}
            onGoToDashboard={handleConfirmedGoToDashboard}
          />
        )
      default:
        return (
          <EarnAmountScreen
            tab={tab}
            balance={sourceBalance}
            amount={amount}
            onTabChange={onTabChange}
            onAmountChange={onAmountChange}
            onCancel={requestClose}
            onReview={onAmountReview}
          />
        )
    }
  }

  return (
    <FlowModalOverlay
      label="Earn"
      exiting={exiting}
      onClose={requestClose}
      initialFocusRef={closeButtonRef}
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={[...EARN_PROGRESS_STEPS]}
        currentStep={EARN_STEP_NUMBER[step]}
        status={isConfirmed ? 'confirmed' : 'default'}
        flowLabel="Earn"
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
