import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DepositChainId } from '@/constants/depositChains'
import type { AmountInputEntryMode } from '@/components/AmountInputScreen'
import { BottomSheet } from '@/components/BottomSheet'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { useMobileLayout } from '@/hooks/useMobileLayout'
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

function depositAmountEntryModeFromSearch(search = window.location.search): AmountInputEntryMode {
  const value = new URLSearchParams(search).get('keypad')
  return value === '1' || value === 'true' ? 'keypad' : 'input'
}

const DEPOSIT_STEP_NUMBER: Record<DepositModalStep, number> = {
  amount: 1,
  review: 2,
  wallet: 3,
  processing: 4,
  confirmed: 4,
}

const DEPOSIT_SIMPLE_HEADER_TITLE: Partial<Record<DepositModalStep, string>> = {
  amount: 'Deposit',
  /** Review opens as a sheet over amount — shell title stays Deposit. */
  review: 'Deposit',
  wallet: 'Confirm',
  processing: 'Deposit in progress',
  /** Confirmed uses the in-screen “Deposit confirmed” headline — no shell title. */
  confirmed: '',
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
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false)
  const confirmAfterSheetExitRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const amountEntryMode = useMemo(() => depositAmountEntryModeFromSearch(), [])
  const isMobile = useMobileLayout()
  const useFamilyMobileChrome = amountEntryMode === 'keypad' && isMobile
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
    <DepositAmountScreen
      balance={depositWalletBalance}
      amount={amount}
      chain={chain}
      entryMode={amountEntryMode}
      amountInputRef={amountEntryMode === 'input' ? amountInputRef : undefined}
      onAmountChange={onAmountChange}
      onCancel={requestClose}
      onReview={onAmountReview}
    />
  )

  function renderStep() {
    switch (step) {
      case 'review':
        // Family mobile: keep amount under the review sheet.
        if (useFamilyMobileChrome) return amountScreen
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
        // Family mobile: keep amount under the wallet approval sheet.
        if (useFamilyMobileChrome) return amountScreen
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
            familyMobileLayout={useFamilyMobileChrome && step === 'processing'}
            onComplete={onProcessingComplete}
            onViewExplorer={onConfirmedViewExplorer}
            onGoToDashboard={handleConfirmedGoToDashboard}
          />
        )
      default:
        return amountScreen
    }
  }

  const stepShellKey =
    isConfirmStep
      ? 'confirm'
      : useFamilyMobileChrome && (step === 'review' || step === 'wallet')
        ? 'amount'
        : step

  return (
    <FlowModalOverlay
      label="Deposit"
      exiting={exiting}
      onClose={requestClose}
      initialFocusRef={
        step === 'amount' && amountEntryMode === 'input' ? amountInputRef : undefined
      }
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={[...DEPOSIT_PROGRESS_STEPS]}
        currentStep={DEPOSIT_STEP_NUMBER[step]}
        status={isConfirmed ? 'confirmed' : 'default'}
        flowLabel="Deposit"
        chrome={useFamilyMobileChrome ? 'simple' : 'default'}
        surface={
          useFamilyMobileChrome && step === 'processing' ? 'immersive' : 'default'
        }
        headerTitle={
          useFamilyMobileChrome ? DEPOSIT_SIMPLE_HEADER_TITLE[step] ?? 'Deposit' : undefined
        }
        onBack={
          useFamilyMobileChrome
            ? step === 'review'
              ? handleReviewBack
              : step === 'amount'
                ? requestClose
                : undefined
            : undefined
        }
        exiting={exiting}
        onClose={requestClose}
        closeButtonRef={closeButtonRef}
      >
        <div key={stepShellKey} className={modalStepShell}>
          {renderStep()}
        </div>
      </ModalShell>

      {useFamilyMobileChrome ? (
        <>
          <BottomSheet
            open={reviewSheetOpen}
            onClose={handleReviewBack}
            onExited={handleReviewSheetExited}
            title="Review"
            showClose={false}
          >
            <DepositReviewScreen
              amount={amount}
              networkName={networkDisplayName(chain)}
              walletAddress={walletAddress}
              walletProvider={walletProvider}
              familyMobileLayout
              onBack={handleReviewBack}
              onConfirm={handleReviewConfirm}
            />
          </BottomSheet>
          {step === 'wallet' ? (
            <DepositWalletApproveScreen
              amount={amount}
              networkName={networkDisplayName(chain)}
              walletAddress={walletAddress}
              familyMobileLayout
              onComplete={onWalletComplete}
              onCancel={onWalletCancel}
            />
          ) : null}
        </>
      ) : null}
    </FlowModalOverlay>
  )
}
