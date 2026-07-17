import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AmountInputEntryMode } from '@/components/AmountInputScreen'
import { BottomSheet } from '@/components/BottomSheet'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import { SendAmountScreen } from './SendAmountScreen'
import { SendProcessingScreen } from './SendProcessingScreen'
import { SendRecipientScreen } from './SendRecipientScreen'
import { SendReviewScreen } from './SendReviewScreen'
import { SEND_PROGRESS_STEPS, type SendChainId } from './sendFlowConstants'

export type SendModalStep = 'recipient' | 'amount' | 'review' | 'processing' | 'confirmed'

function sendAmountEntryModeFromSearch(search = window.location.search): AmountInputEntryMode {
  const value = new URLSearchParams(search).get('keypad')
  return value === '1' || value === 'true' ? 'keypad' : 'input'
}

const SEND_STEP_NUMBER: Record<SendModalStep, number> = {
  recipient: 1,
  amount: 2,
  review: 3,
  processing: 4,
  confirmed: 4,
}

const SEND_SIMPLE_HEADER_TITLE: Partial<Record<SendModalStep, string>> = {
  recipient: 'Send',
  amount: 'Send',
  /** Review opens as a sheet over amount — shell title stays Send. */
  review: 'Send',
  processing: 'Send in progress',
  /** Confirmed uses the in-screen “Send confirmed” headline — no shell title. */
  confirmed: '',
}

export interface SendModalFlowProps {
  step: SendModalStep
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

export function SendModalFlow({
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
}: SendModalFlowProps) {
  const [exiting, setExiting] = useState(false)
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false)
  const confirmAfterSheetExitRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const amountEntryMode = useMemo(() => sendAmountEntryModeFromSearch(), [])
  const isMobile = useMobileLayout()
  const useFamilyMobileChrome = amountEntryMode === 'keypad' && isMobile
  const isConfirmStep = step === 'processing' || step === 'confirmed'
  const isConfirmed = step === 'confirmed'
  const resolvedArmadaAddress = armadaAddress ?? DEMO_ARMADA_ADDRESS

  const requestClose = useCallback(() => {
    setExiting((current) => (current ? current : true))
  }, [])

  useEffect(() => {
    if (!exiting) return
    const timer = window.setTimeout(() => onCloseRef.current(), MODAL_EXIT_TOTAL_MS)
    return () => window.clearTimeout(timer)
  }, [exiting])

  useEffect(() => {
    if (!useFamilyMobileChrome) {
      setReviewSheetOpen(false)
      confirmAfterSheetExitRef.current = false
      return
    }
    if (step === 'review') {
      setReviewSheetOpen(true)
      return
    }
    if (!confirmAfterSheetExitRef.current) {
      setReviewSheetOpen(false)
    }
  }, [step, useFamilyMobileChrome])

  function handleConfirmedGoToDashboard() {
    onConfirmedGoToDashboard()
    requestClose()
  }

  function handleReviewConfirm() {
    if (!useFamilyMobileChrome) {
      onReviewConfirm()
      return
    }
    confirmAfterSheetExitRef.current = true
    setReviewSheetOpen(false)
  }

  function handleReviewSheetExited() {
    if (!confirmAfterSheetExitRef.current) return
    confirmAfterSheetExitRef.current = false
    onReviewConfirm()
  }

  function handleReviewBack() {
    confirmAfterSheetExitRef.current = false
    setReviewSheetOpen(false)
    onReviewBack()
  }

  const amountScreen = (
    <SendAmountScreen
      balance={armadaBalance}
      amount={amount}
      entryMode={amountEntryMode}
      amountInputRef={amountEntryMode === 'input' ? amountInputRef : undefined}
      onAmountChange={onAmountChange}
      onBack={onAmountBack}
      onReview={onAmountReview}
    />
  )

  const recipientScreen = (
    <SendRecipientScreen
      recipient={recipient}
      chain={chain}
      onRecipientChange={onRecipientChange}
      onChainChange={onChainChange}
      onContinue={onRecipientContinue}
    />
  )

  function renderStep() {
    switch (step) {
      case 'amount':
        return amountScreen
      case 'review':
        // Family mobile: keep amount under the review sheet (including while it exits).
        if (useFamilyMobileChrome) return amountScreen
        return (
          <SendReviewScreen
            amount={amount}
            recipient={recipient}
            chain={chain}
            armadaAddress={resolvedArmadaAddress}
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
            armadaAddress={resolvedArmadaAddress}
            confirmedAt={confirmedAt ?? Date.now()}
            confirmed={isConfirmed}
            familyMobileLayout={useFamilyMobileChrome && step === 'processing'}
            onComplete={onProcessingComplete}
            onViewExplorer={onConfirmedViewExplorer}
            onGoToDashboard={handleConfirmedGoToDashboard}
          />
        )
      default:
        return recipientScreen
    }
  }

  const stepShellKey =
    isConfirmStep
      ? 'confirm'
      : useFamilyMobileChrome && step === 'review'
        ? 'amount'
        : step

  const familyBack =
    step === 'review'
      ? handleReviewBack
      : step === 'amount'
        ? onAmountBack
        : step === 'recipient'
          ? requestClose
          : undefined

  return (
    <FlowModalOverlay
      label="Send"
      exiting={exiting}
      onClose={requestClose}
      initialFocusRef={
        step === 'amount' && amountEntryMode === 'input' ? amountInputRef : undefined
      }
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={[...SEND_PROGRESS_STEPS]}
        currentStep={SEND_STEP_NUMBER[step]}
        status={isConfirmed ? 'confirmed' : 'default'}
        flowLabel="Send"
        chrome={useFamilyMobileChrome ? 'simple' : 'default'}
        surface={
          useFamilyMobileChrome && step === 'processing' ? 'immersive' : 'default'
        }
        headerTitle={
          useFamilyMobileChrome ? SEND_SIMPLE_HEADER_TITLE[step] ?? 'Send' : undefined
        }
        onBack={useFamilyMobileChrome ? familyBack : undefined}
        exiting={exiting}
        onClose={requestClose}
        closeButtonRef={closeButtonRef}
      >
        <div key={stepShellKey} className={modalStepShell}>
          {renderStep()}
        </div>
      </ModalShell>

      {useFamilyMobileChrome ? (
        <BottomSheet
          open={reviewSheetOpen}
          onClose={handleReviewBack}
          onExited={handleReviewSheetExited}
          title="Review"
          showClose={false}
        >
          <SendReviewScreen
            amount={amount}
            recipient={recipient}
            chain={chain}
            armadaAddress={resolvedArmadaAddress}
            familyMobileLayout
            onBack={handleReviewBack}
            onConfirm={handleReviewConfirm}
          />
        </BottomSheet>
      ) : null}
    </FlowModalOverlay>
  )
}
