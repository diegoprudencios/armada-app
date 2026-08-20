import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AmountInputEntryMode, ShieldDirection } from '@/components/AmountInputScreen'
import { BottomSheet, afterBottomSheetHandoff } from '@/components/BottomSheet'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, ModalStepSwitch } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { resolveAmountEntryMode } from '@/utils/amountEntryMode'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import { DepositAmountScreen } from './DepositAmountScreen'
import { SendProcessingScreen } from './SendProcessingScreen'
import { SendRecipientScreen } from './SendRecipientScreen'
import { SendReviewScreen } from './SendReviewScreen'
import { type SendChainId } from './sendFlowConstants'
import { WITHDRAW_PROGRESS_STEPS, type WithdrawModalStep } from './withdrawFlowConstants'

function withdrawAmountEntryModeFromSearch(search = window.location.search): AmountInputEntryMode {
  return resolveAmountEntryMode(search)
}

const WITHDRAW_STEP_NUMBER: Record<WithdrawModalStep, number> = {
  recipient: 1,
  amount: 2,
  review: 3,
  processing: 4,
  confirmed: 4,
}

const WITHDRAW_SIMPLE_HEADER_TITLE: Partial<Record<WithdrawModalStep, string>> = {
  recipient: 'Unshield',
  amount: 'Unshield',
  /** Review opens as a sheet over amount — shell title stays Unshield. */
  review: 'Unshield',
  processing: 'Unshield in progress',
  /** Confirmed uses the in-screen “Unshield confirmed” headline — no shell title. */
  confirmed: '',
}

export interface WithdrawModalFlowProps {
  step: WithdrawModalStep
  amount: string
  recipient: string
  chain: SendChainId
  armadaBalance: number
  depositWalletBalance?: number
  armadaAddress?: string
  confirmedAt?: number | null
  onClose: () => void
  onRecipientChange: (recipient: string) => void
  onChainChange: (chain: SendChainId) => void
  onRecipientContinue: () => void
  onAmountChange: (amount: string) => void
  onAmountBack: () => void
  onAmountReview: (amount: string) => void
  onShieldReview?: (amount: string) => void
  onReviewBack: () => void
  onReviewConfirm: () => void
  onProcessingComplete: () => void
  onConfirmedViewExplorer?: () => void
  onConfirmedGoToDashboard: () => void
  skipEnter?: boolean
}

export function WithdrawModalFlow({
  step,
  amount,
  recipient,
  chain,
  armadaBalance,
  depositWalletBalance = 0,
  armadaAddress,
  confirmedAt,
  onClose,
  onRecipientChange,
  onChainChange,
  onRecipientContinue,
  onAmountChange,
  onAmountBack,
  onAmountReview,
  onShieldReview,
  onReviewBack,
  onReviewConfirm,
  onProcessingComplete,
  onConfirmedViewExplorer,
  onConfirmedGoToDashboard,
  skipEnter = false,
}: WithdrawModalFlowProps) {
  const [exiting, setExiting] = useState(false)
  const [direction, setDirection] = useState<ShieldDirection>('unshield')
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false)
  const confirmAfterSheetExitRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const amountEntryMode = useMemo(() => withdrawAmountEntryModeFromSearch(), [])
  const isMobile = useMobileLayout()
  const useKeypadMobileChrome = amountEntryMode === 'keypad' && isMobile
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
    if (!useKeypadMobileChrome) {
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
  }, [step, useKeypadMobileChrome])

  function handleConfirmedGoToDashboard() {
    onConfirmedGoToDashboard()
    requestClose()
  }

  function handleReviewConfirm() {
    if (!useKeypadMobileChrome) {
      onReviewConfirm()
      return
    }
    confirmAfterSheetExitRef.current = true
    setReviewSheetOpen(false)
  }

  function handleReviewSheetExited() {
    if (!confirmAfterSheetExitRef.current) return
    confirmAfterSheetExitRef.current = false
    afterBottomSheetHandoff(() => {
      onReviewConfirm()
    })
  }

  function handleReviewBack() {
    confirmAfterSheetExitRef.current = false
    setReviewSheetOpen(false)
    onReviewBack()
  }

  const amountScreen = (
    <DepositAmountScreen
      balance={direction === 'shield' ? depositWalletBalance : armadaBalance}
      amount={amount}
      direction={direction}
      onDirectionChange={setDirection}
      entryMode={amountEntryMode}
      amountInputRef={amountEntryMode === 'input' ? amountInputRef : undefined}
      onAmountChange={onAmountChange}
      onCancel={onAmountBack}
      onReview={(nextAmount) => {
        if (direction === 'shield') {
          onShieldReview?.(nextAmount)
          return
        }
        onAmountReview(nextAmount)
      }}
    />
  )

  const recipientScreen = (
    <SendRecipientScreen
      recipient={recipient}
      chain={chain}
      variant="withdraw"
      showRecentAddresses={false}
      onRecipientChange={onRecipientChange}
      onChainChange={onChainChange}
      onCancel={requestClose}
      onContinue={onRecipientContinue}
    />
  )

  function renderStep() {
    switch (step) {
      case 'amount':
        return amountScreen
      case 'review':
        // Mobile keypad: keep amount under the review sheet (including while it exits).
        if (useKeypadMobileChrome) return amountScreen
        return (
          <SendReviewScreen
            amount={amount}
            recipient={recipient}
            chain={chain}
            armadaAddress={resolvedArmadaAddress}
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
            armadaAddress={resolvedArmadaAddress}
            confirmedAt={confirmedAt ?? Date.now()}
            confirmed={isConfirmed}
            variant="withdraw"
            keypadMobileLayout={useKeypadMobileChrome && step === 'processing'}
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
      : useKeypadMobileChrome && step === 'review'
        ? 'amount'
        : step

  const keypadBack =
    step === 'review'
      ? handleReviewBack
      : step === 'amount'
        ? onAmountBack
        : step === 'recipient'
          ? requestClose
          : undefined

  return (
    <FlowModalOverlay
      label="Unshield"
      exiting={exiting}
      onClose={requestClose}
      initialFocusRef={
        step === 'amount' && amountEntryMode === 'input' ? amountInputRef : undefined
      }
      skipEnter={skipEnter}
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={[...WITHDRAW_PROGRESS_STEPS]}
        currentStep={WITHDRAW_STEP_NUMBER[step]}
        status={isConfirmed ? 'confirmed' : 'default'}
        flowLabel="Unshield"
        chrome={useKeypadMobileChrome ? 'simple' : 'default'}
        surface={
          useKeypadMobileChrome && step === 'processing' ? 'immersive' : 'default'
        }
        headerTitle={
          useKeypadMobileChrome ? WITHDRAW_SIMPLE_HEADER_TITLE[step] ?? 'Unshield' : undefined
        }
        onBack={useKeypadMobileChrome ? keypadBack : undefined}
        exiting={exiting}
        onClose={requestClose}
        closeButtonRef={closeButtonRef}
      >
        <ModalStepSwitch stepKey={stepShellKey} skipExit={exiting}>
          {renderStep()}
        </ModalStepSwitch>
      </ModalShell>

      {useKeypadMobileChrome ? (
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
            variant="withdraw"
            keypadMobileLayout
            onBack={handleReviewBack}
            onConfirm={handleReviewConfirm}
          />
        </BottomSheet>
      ) : null}
    </FlowModalOverlay>
  )
}
