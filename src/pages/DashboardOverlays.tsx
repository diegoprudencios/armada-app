import { ConnectWalletOverlay } from '@/components/ConnectWalletOverlay'
import type { ConnectedWallet } from '@/utils/walletMenu'
import type { useDashboardDemoState } from '@/hooks/useDashboardDemoState'
import {
  TESTING_FLOW_QUESTION_SHIELD_EXPECTATION,
  TESTING_FLOW_QUESTION_VAULT_DEPOSIT,
  TESTING_FLOW_QUESTION_WITHDRAW_PRIVACY,
  TESTING_FLOW_QUESTION_REQUEST_COMPREHENSION,
  testingFlowQuestionSendPrivacyCertainty,
  useSessionLogger,
} from '@/testingFeedback'
import {
  DEMO_ADDRESS_BY_PROVIDER,
  DEPOSIT_WALLET_BALANCE,
  DEMO_ARMADA_ADDRESS,
} from './depositFlowConstants'
import { isArmadaAddress } from './sendFlowConstants'
import { DepositModalFlow } from './DepositModalFlow'
import { EarnModalFlow } from './EarnModalFlow'
import { SendModalFlow } from './SendModalFlow'
import { WithdrawModalFlow } from './WithdrawModalFlow'
import { RequestModalFlow } from './RequestModalFlow'
import { ReceivePaymentModalFlow } from './ReceivePaymentModalFlow'

type DashboardDemoState = ReturnType<typeof useDashboardDemoState>

function liveWalletUsdcBalance(
  connectedWallets: readonly ConnectedWallet[],
  activeWalletId: string | null,
  provider: string | undefined,
): number {
  const active = connectedWallets.find((entry) => entry.id === activeWalletId)
  if (active) return active.usdcBalance
  if (provider && provider in DEMO_ADDRESS_BY_PROVIDER) {
    return Number(DEPOSIT_WALLET_BALANCE)
  }
  return Number(DEPOSIT_WALLET_BALANCE)
}

export interface DashboardOverlaysProps {
  state: DashboardDemoState
}

/** Connect overlay plus deposit / send / earn / withdraw / request / receive flows. */
export function DashboardOverlays({ state }: DashboardOverlaysProps) {
  const { notifyFirstDepositComplete, showFlowQuestion } = useSessionLogger()
  const {
    wallet,
    connectedWallets,
    activeWalletId,
    connectOpen,
    depositStep,
    depositAmount,
    depositChain,
    depositConfirmedAt,
    depositSkipEnter,
    sendStep,
    sendAmount,
    sendRecipient,
    sendChain,
    sendConfirmedAt,
    earnStep,
    earnTab,
    earnAmount,
    earnConfirmedAt,
    earnSourceBalance,
    dashboardBalance,
    withdrawStep,
    withdrawRecipient,
    withdrawAmount,
    withdrawChain,
    withdrawConfirmedAt,
    withdrawSkipRecipient,
    withdrawSkipEnter,
    requestStep,
    requestAmount,
    requestNote,
    requestExpiryId,
    requestPaymentLink,
    requestId,
    requestExpiresAt,
    requestLinkRevoked,
    requestConfirmedAt,
    requestReceiptTxHash,
    receivePaymentStep,
    receivePaymentAmount,
    receivePaymentSender,
    receivePaymentChain,
    receivePaymentConfirmedAt,
    receivePaymentTxHash,
    connectWallet,
    dismissConnect,
    closeDeposit,
    completeDeposit,
    closeSend,
    completeSend,
    closeEarn,
    completeEarn,
    switchToUnshieldReview,
    switchToShieldReview,
    closeWithdraw,
    completeWithdraw,
    closeRequest,
    completeRequestLink,
    markRequestLinkRevoked,
    closeReceivePayment,
    setDepositAmount,
    setDepositChain,
    setDepositStep,
    setDepositConfirmedAt,
    setSendAmount,
    setSendRecipient,
    setSendChain,
    setSendStep,
    setSendConfirmedAt,
    setEarnTab,
    setEarnAmount,
    setEarnStep,
    setEarnConfirmedAt,
    setWithdrawRecipient,
    setWithdrawAmount,
    setWithdrawChain,
    setWithdrawStep,
    setWithdrawConfirmedAt,
    setRequestAmount,
    setRequestNote,
    setRequestExpiryId,
    setRequestStep,
  } = state

  const walletUsdcBalance = liveWalletUsdcBalance(
    connectedWallets,
    activeWalletId,
    wallet?.provider,
  )

  return (
    <>
      {connectOpen ? (
        <ConnectWalletOverlay onSelect={connectWallet} onDismiss={dismissConnect} />
      ) : null}

      {depositStep ? (
        <DepositModalFlow
          step={depositStep}
          amount={depositAmount}
          chain={depositChain}
          depositWalletBalance={walletUsdcBalance}
          armadaBalance={dashboardBalance}
          walletAddress={wallet?.address}
          walletProvider={wallet?.provider}
          confirmedAt={depositConfirmedAt}
          skipEnter={depositSkipEnter}
          onClose={closeDeposit}
          onAmountChange={setDepositAmount}
          onAmountReview={(nextAmount, nextChain) => {
            setDepositAmount(nextAmount)
            setDepositChain(nextChain)
            setDepositStep('review')
          }}
          onUnshieldReview={switchToUnshieldReview}
          onReviewBack={() => setDepositStep('amount')}
          onReviewConfirm={() => setDepositStep('wallet')}
          onWalletComplete={() => setDepositStep('processing')}
          onWalletCancel={() => setDepositStep('review')}
          onProcessingComplete={() => {
            setDepositConfirmedAt(Date.now())
            setDepositStep('confirmed')
            notifyFirstDepositComplete()
            showFlowQuestion(TESTING_FLOW_QUESTION_SHIELD_EXPECTATION)
          }}
          onConfirmedGoToDashboard={completeDeposit}
        />
      ) : null}

      {sendStep ? (
        <SendModalFlow
          step={sendStep}
          amount={sendAmount}
          recipient={sendRecipient}
          chain={sendChain}
          armadaBalance={dashboardBalance}
          armadaAddress={DEMO_ARMADA_ADDRESS}
          confirmedAt={sendConfirmedAt}
          onClose={closeSend}
          onRecipientChange={setSendRecipient}
          onChainChange={setSendChain}
          onRecipientContinue={() => setSendStep('amount')}
          onAmountChange={setSendAmount}
          onAmountBack={() => setSendStep('recipient')}
          onAmountReview={(nextAmount) => {
            setSendAmount(nextAmount)
            setSendStep('review')
          }}
          onReviewBack={() => setSendStep('amount')}
          onReviewConfirm={() => setSendStep('processing')}
          onProcessingComplete={() => {
            setSendConfirmedAt(Date.now())
            setSendStep('confirmed')
            const mode = isArmadaAddress(sendRecipient) ? 'private' : 'public'
            showFlowQuestion(testingFlowQuestionSendPrivacyCertainty(mode))
          }}
          onConfirmedGoToDashboard={completeSend}
        />
      ) : null}

      {earnStep ? (
        <EarnModalFlow
          step={earnStep}
          tab={earnTab}
          amount={earnAmount}
          sourceBalance={earnSourceBalance}
          confirmedAt={earnConfirmedAt}
          onClose={closeEarn}
          onTabChange={setEarnTab}
          onAmountChange={setEarnAmount}
          onAmountReview={(nextAmount) => {
            setEarnAmount(nextAmount)
            setEarnStep('review')
          }}
          onReviewBack={() => setEarnStep('amount')}
          onReviewConfirm={() => setEarnStep('processing')}
          onProcessingComplete={() => {
            setEarnConfirmedAt(Date.now())
            setEarnStep('confirmed')
            if (earnTab === 'add') {
              showFlowQuestion(TESTING_FLOW_QUESTION_VAULT_DEPOSIT)
            }
          }}
          onConfirmedGoToDashboard={completeEarn}
        />
      ) : null}

      {withdrawStep ? (
        <WithdrawModalFlow
          step={withdrawStep}
          amount={withdrawAmount}
          recipient={withdrawRecipient}
          chain={withdrawChain}
          armadaBalance={dashboardBalance}
          depositWalletBalance={walletUsdcBalance}
          armadaAddress={DEMO_ARMADA_ADDRESS}
          confirmedAt={withdrawConfirmedAt}
          skipEnter={withdrawSkipEnter}
          onClose={closeWithdraw}
          onRecipientChange={setWithdrawRecipient}
          onChainChange={setWithdrawChain}
          onRecipientContinue={() => setWithdrawStep('amount')}
          onAmountChange={setWithdrawAmount}
          onAmountBack={() => {
            if (withdrawSkipRecipient) closeWithdraw()
            else setWithdrawStep('recipient')
          }}
          onAmountReview={(nextAmount) => {
            setWithdrawAmount(nextAmount)
            setWithdrawStep('review')
          }}
          onShieldReview={switchToShieldReview}
          onReviewBack={() => setWithdrawStep('amount')}
          onReviewConfirm={() => setWithdrawStep('processing')}
          onProcessingComplete={() => {
            setWithdrawConfirmedAt(Date.now())
            setWithdrawStep('confirmed')
            showFlowQuestion(TESTING_FLOW_QUESTION_WITHDRAW_PRIVACY)
          }}
          onConfirmedGoToDashboard={completeWithdraw}
        />
      ) : null}

      {requestStep ? (
        <RequestModalFlow
          step={requestStep}
          privateAddress={DEMO_ARMADA_ADDRESS}
          amount={requestAmount}
          note={requestNote}
          expiryId={requestExpiryId}
          paymentLink={requestPaymentLink}
          requestId={requestId}
          expiresAt={requestExpiresAt}
          linkRevoked={requestLinkRevoked}
          confirmedAt={requestConfirmedAt}
          receiptTxHash={requestReceiptTxHash}
          onClose={closeRequest}
          onAmountChange={setRequestAmount}
          onNoteChange={setRequestNote}
          onExpiryChange={setRequestExpiryId}
          onChooseRequestViaLink={() => setRequestStep('amount')}
          onAmountContinue={(nextAmount) => {
            setRequestAmount(nextAmount)
            setRequestStep('details')
          }}
          onAmountBack={closeRequest}
          onDetailsBack={() => setRequestStep('amount')}
          onCreateLink={(payload) => {
            completeRequestLink(payload)
            showFlowQuestion(TESTING_FLOW_QUESTION_REQUEST_COMPREHENSION)
          }}
          onLinkRevoked={markRequestLinkRevoked}
          onDone={closeRequest}
        />
      ) : null}

      {receivePaymentStep ? (
        <ReceivePaymentModalFlow
          amount={receivePaymentAmount}
          sender={receivePaymentSender}
          chain={receivePaymentChain}
          txHash={receivePaymentTxHash}
          confirmedAt={receivePaymentConfirmedAt ?? Date.now()}
          armadaAddress={DEMO_ARMADA_ADDRESS}
          onClose={closeReceivePayment}
        />
      ) : null}
    </>
  )
}
