import { useCallback, useEffect, useRef, useState } from 'react'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { DepositWalletApproveScreen } from './DepositWalletApproveScreen'
import { SendAmountScreen } from './SendAmountScreen'
import { SendProcessingScreen } from './SendProcessingScreen'
import { SendRecipientScreen } from './SendRecipientScreen'
import { SendReviewScreen } from './SendReviewScreen'
import {
  isArmadaAddress,
  sendNetworkDisplayName,
  sendWalletSignLabel,
  type SendChainId,
} from './sendFlowConstants'
import { WITHDRAW_PROGRESS_STEPS, type WithdrawModalStep } from './withdrawFlowConstants'
import styles from './WithdrawModalFlow.module.css'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import { calculateSendFee } from '@/utils/sendFee'

const WITHDRAW_STEP_NUMBER: Record<WithdrawModalStep, number> = {
  recipient: 1,
  amount: 2,
  review: 3,
  wallet: 4,
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
  walletAddress?: string
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
  onWalletComplete: () => void
  onWalletCancel: () => void
  onProcessingCancel: () => void
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
  walletAddress,
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
  onWalletComplete,
  onWalletCancel,
  onProcessingCancel,
  onProcessingComplete,
  onConfirmedViewExplorer,
  onConfirmedGoToDashboard,
}: WithdrawModalFlowProps) {
  const [exiting, setExiting] = useState(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const isConfirmStep = step === 'processing' || step === 'confirmed'
  const isConfirmed = step === 'confirmed'
  const isPrivateRecipient = isArmadaAddress(recipient)
  const walletNetworkName = isPrivateRecipient ? 'Armada' : sendNetworkDisplayName(chain)

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
      case 'wallet':
        return (
          <DepositWalletApproveScreen
            amount={amount}
            networkName={walletNetworkName}
            walletAddress={walletAddress}
            signStepLabel={sendWalletSignLabel('withdraw')}
            computeFeeUsdc={calculateSendFee}
            onComplete={onWalletComplete}
            onCancel={onWalletCancel}
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
            onCancel={onProcessingCancel}
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

  const overlayClassName = [styles.overlay, exiting && styles.overlayExiting].filter(Boolean).join(' ')

  return (
    <div
      className={overlayClassName}
      role="presentation"
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={[...WITHDRAW_PROGRESS_STEPS]}
        currentStep={WITHDRAW_STEP_NUMBER[step]}
        status={isConfirmed ? 'confirmed' : 'default'}
        flowLabel="Withdraw"
        contentOffset={isConfirmed ? 'confirmation' : 'default'}
        exiting={exiting}
        onClose={requestClose}
      >
        <div key={isConfirmStep ? 'confirm' : step} className={modalStepShell}>
          {renderStep()}
        </div>
      </ModalShell>
    </div>
  )
}
