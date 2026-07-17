import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import type { AmountInputEntryMode } from '@/components/AmountInputScreen'
import { BottomSheet, afterBottomSheetHandoff } from '@/components/BottomSheet'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { EarnAmountScreen } from './EarnAmountScreen'
import chooserStyles from './EarnChooserSheet.module.css'
import { EarnProcessingScreen } from './EarnProcessingScreen'
import { EarnReviewScreen } from './EarnReviewScreen'
import {
  DEMO_EARN_APY,
  EARN_PROGRESS_STEPS,
  formatDemoApy,
  type EarnModalStep,
  type EarnTab,
} from './earnFlowConstants'

const EARN_STEP_NUMBER: Record<EarnModalStep, number> = {
  choose: 1,
  amount: 1,
  review: 2,
  processing: 3,
  confirmed: 3,
}

function earnSimpleHeaderTitle(step: EarnModalStep, tab: EarnTab): string {
  if (step === 'confirmed') return ''
  if (step === 'amount' || step === 'review' || step === 'processing') {
    return tab === 'add' ? 'Deposit to vault' : 'Withdraw from vault'
  }
  return 'Earn'
}

function earnAmountEntryModeFromSearch(search = window.location.search): AmountInputEntryMode {
  const value = new URLSearchParams(search).get('keypad')
  return value === '1' || value === 'true' ? 'keypad' : 'input'
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
  onChooseDeposit: () => void
  onChooseWithdraw: () => void
  onAmountChange: (amount: string) => void
  onAmountBack: () => void
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
  onChooseDeposit,
  onChooseWithdraw,
  onAmountChange,
  onAmountBack,
  onAmountReview,
  onReviewBack,
  onReviewConfirm,
  onProcessingComplete,
  onConfirmedViewExplorer,
  onConfirmedGoToDashboard,
}: EarnModalFlowProps) {
  const [exiting, setExiting] = useState(false)
  const [chooserOpen, setChooserOpen] = useState(step === 'choose')
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false)
  const confirmAfterSheetExitRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const chooserIntentRef = useRef<'close' | 'deposit' | 'withdraw' | null>(null)
  const amountEntryMode = useMemo(() => earnAmountEntryModeFromSearch(), [])
  const isMobile = useMobileLayout()
  const useKeypadMobileChrome = amountEntryMode === 'keypad' && isMobile
  const isConfirmStep = step === 'processing' || step === 'confirmed'
  const isConfirmed = step === 'confirmed'
  const showModal = !(useKeypadMobileChrome && step === 'choose')

  const requestClose = useCallback(() => {
    setExiting((current) => (current ? current : true))
  }, [])

  useEffect(() => {
    if (!exiting) return
    const timer = window.setTimeout(() => onCloseRef.current(), MODAL_EXIT_TOTAL_MS)
    return () => window.clearTimeout(timer)
  }, [exiting])

  useEffect(() => {
    if (step === 'choose') {
      chooserIntentRef.current = null
      const timer = afterBottomSheetHandoff(() => {
        setChooserOpen(true)
      })
      return () => window.clearTimeout(timer)
    }
    if (chooserIntentRef.current !== 'deposit' && chooserIntentRef.current !== 'withdraw') {
      setChooserOpen(false)
    }
  }, [step])

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

  function handleChooserClose() {
    chooserIntentRef.current = 'close'
    setChooserOpen(false)
  }

  function handleChooserExited() {
    const intent = chooserIntentRef.current
    chooserIntentRef.current = null
    afterBottomSheetHandoff(() => {
      if (intent === 'deposit') {
        onChooseDeposit()
        return
      }
      if (intent === 'withdraw') {
        onChooseWithdraw()
        return
      }
      if (intent === 'close' || step === 'choose') {
        onClose()
      }
    })
  }

  function handleChooseDeposit() {
    chooserIntentRef.current = 'deposit'
    setChooserOpen(false)
  }

  function handleChooseWithdraw() {
    chooserIntentRef.current = 'withdraw'
    setChooserOpen(false)
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
      onTabChange={onTabChange}
      onAmountChange={onAmountChange}
      onCancel={useKeypadMobileChrome ? onAmountBack : requestClose}
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
        ? onAmountBack
        : undefined

  const chooserSheet = useKeypadMobileChrome ? (
    <BottomSheet
      open={chooserOpen}
      onClose={handleChooserClose}
      onExited={handleChooserExited}
      title="Earn"
      ariaLabel="Earn"
    >
      <div className={chooserStyles.sheet}>
        <div className={chooserStyles.apyBlock}>
          <p className={chooserStyles.apyLabel}>Estimated APY</p>
          <p className={chooserStyles.apyValue}>{formatDemoApy(apy)}</p>
          <p className={chooserStyles.apyCaveat}>
            Based on the vault&apos;s recent rate; the actual yield earned will vary.
          </p>
        </div>

        <div className={chooserStyles.list} role="menu">
          <button
            type="button"
            className={chooserStyles.item}
            role="menuitem"
            onClick={handleChooseDeposit}
          >
            <span className={chooserStyles.itemLead}>
              <span className={chooserStyles.iconBadge}>
                <ArrowDownTrayIcon className={chooserStyles.icon} strokeWidth={1.5} />
              </span>
              <span className={chooserStyles.label}>Deposit to the vault</span>
            </span>
          </button>
          <button
            type="button"
            className={chooserStyles.item}
            role="menuitem"
            onClick={handleChooseWithdraw}
          >
            <span className={chooserStyles.itemLead}>
              <span className={chooserStyles.iconBadge}>
                <ArrowUpTrayIcon className={chooserStyles.icon} strokeWidth={1.5} />
              </span>
              <span className={chooserStyles.label}>Withdraw from the vault</span>
            </span>
          </button>
        </div>
      </div>
    </BottomSheet>
  ) : null

  if (!showModal) {
    return chooserSheet
  }

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
            useKeypadMobileChrome ? earnSimpleHeaderTitle(step, tab) : undefined
          }
          onBack={useKeypadMobileChrome ? keypadBack : undefined}
          exiting={exiting}
          onClose={requestClose}
          closeButtonRef={closeButtonRef}
        >
          <div key={stepShellKey} className={modalStepShell}>
            {renderStep()}
          </div>
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

      {chooserSheet}
    </>
  )
}
