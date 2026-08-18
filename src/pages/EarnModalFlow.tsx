import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AmountInputEntryMode } from '@/components/AmountInputScreen'
import { BottomSheet, afterBottomSheetHandoff } from '@/components/BottomSheet'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, ModalStepSwitch } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { SegmentedControl } from '@/components/SegmentedControl'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { resolveAmountEntryMode } from '@/utils/amountEntryMode'
import { EarnAmountScreen } from './EarnAmountScreen'
import { EarnProcessingScreen } from './EarnProcessingScreen'
import { EarnReviewScreen } from './EarnReviewScreen'
import {
  DEMO_EARN_APY,
  EARN_PROGRESS_STEPS,
  EARN_TABS,
  type EarnModalStep,
  type EarnTab,
} from './earnFlowConstants'

const EARN_STEP_NUMBER: Record<EarnModalStep, number> = {
  amount: 1,
  review: 2,
  processing: 3,
  confirmed: 3,
}

function earnSimpleHeaderTitle(step: EarnModalStep): string {
  return step === 'confirmed' ? '' : 'Earn'
}

function earnAmountEntryModeFromSearch(search = window.location.search): AmountInputEntryMode {
  return resolveAmountEntryMode(search)
}

export interface EarnModalFlowProps {
  step: EarnModalStep
  tab: EarnTab
  amount: string
  sourceBalance: number
  apy?: number
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
  apy = DEMO_EARN_APY,
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
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false)
  const confirmAfterSheetExitRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const amountEntryMode = useMemo(() => earnAmountEntryModeFromSearch(), [])
  const isMobile = useMobileLayout()
  const useKeypadMobileChrome = amountEntryMode === 'keypad' && isMobile
  const isConfirmStep = step === 'processing' || step === 'confirmed'
  const isConfirmed = step === 'confirmed'
  const showMobileEarnTabs =
    useKeypadMobileChrome && (step === 'amount' || step === 'review')

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

  function handleTabChange(next: EarnTab) {
    if (next === tab) return
    onTabChange(next)
    onAmountChange('')
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
    <EarnAmountScreen
      tab={tab}
      balance={sourceBalance}
      amount={amount}
      apy={apy}
      entryMode={amountEntryMode}
      hideModeTabs={useKeypadMobileChrome}
      amountInputRef={amountEntryMode === 'input' ? amountInputRef : undefined}
      onTabChange={handleTabChange}
      onAmountChange={onAmountChange}
      onCancel={requestClose}
      onReview={onAmountReview}
    />
  )

  function renderStep() {
    switch (step) {
      case 'review':
        if (useKeypadMobileChrome) return amountScreen
        return (
          <EarnReviewScreen
            tab={tab}
            amount={amount}
            apy={apy}
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
            keypadMobileLayout={useKeypadMobileChrome && step === 'processing'}
            onComplete={onProcessingComplete}
            onViewExplorer={onConfirmedViewExplorer}
            onGoToDashboard={handleConfirmedGoToDashboard}
          />
        )
      case 'amount':
        return amountScreen
      default:
        return amountScreen
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
        ? requestClose
        : undefined

  return (
    <>
      <FlowModalOverlay
        label="Earn"
        exiting={exiting}
        onClose={requestClose}
        initialFocusRef={
          step === 'amount' && amountEntryMode === 'input' ? amountInputRef : undefined
        }
        style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
      >
        <ModalShell
          steps={[...EARN_PROGRESS_STEPS]}
          currentStep={EARN_STEP_NUMBER[step]}
          status={isConfirmed ? 'confirmed' : 'default'}
          flowLabel="Earn"
          chrome={useKeypadMobileChrome ? 'simple' : 'default'}
          surface={
            useKeypadMobileChrome && step === 'processing' ? 'immersive' : 'default'
          }
          headerTitle={
            useKeypadMobileChrome && !showMobileEarnTabs
              ? earnSimpleHeaderTitle(step)
              : undefined
          }
          headerCenter={
            showMobileEarnTabs ? (
              <SegmentedControl<EarnTab>
                size="sm"
                aria-label="Add to vault or withdraw"
                value={tab}
                onChange={handleTabChange}
                options={EARN_TABS}
              />
            ) : undefined
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
      </FlowModalOverlay>

      {useKeypadMobileChrome ? (
        <BottomSheet
          open={reviewSheetOpen}
          onClose={handleReviewBack}
          onExited={handleReviewSheetExited}
          title="Review"
          showClose={false}
        >
          <EarnReviewScreen
            tab={tab}
            amount={amount}
            apy={apy}
            keypadMobileLayout
            onBack={handleReviewBack}
            onConfirm={handleReviewConfirm}
          />
        </BottomSheet>
      ) : null}
    </>
  )
}
