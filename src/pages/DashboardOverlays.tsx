import { ConnectWalletOverlay } from '@/components/ConnectWalletOverlay'
import type { useDashboardDemoState } from '@/hooks/useDashboardDemoState'
import { DEPOSIT_WALLET_BALANCE, DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import { DepositModalFlow } from './DepositModalFlow'
import { EarnModalFlow } from './EarnModalFlow'
import { SendModalFlow } from './SendModalFlow'
import { WithdrawModalFlow } from './WithdrawModalFlow'

type DashboardDemoState = ReturnType<typeof useDashboardDemoState>

export interface DashboardOverlaysProps {
  state: DashboardDemoState
}

/** Connect wallet + deposit/send modal flows shared by all dashboard layout variants. */
export function DashboardOverlays({ state }: DashboardOverlaysProps) {
  const {
    wallet,
    connectOpen,
    depositStep,
    depositAmount,
    depositChain,
    depositConfirmedAt,
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
    connectWallet,
    closeDeposit,
    completeDeposit,
    closeSend,
    completeSend,
    closeEarn,
    completeEarn,
    openWithdraw,
    closeWithdraw,
    completeWithdraw,
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
  } = state

  return (
    <>
      {connectOpen ? <ConnectWalletOverlay onSelect={connectWallet} /> : null}

      {depositStep ? (
        <DepositModalFlow
          step={depositStep}
          amount={depositAmount}
          chain={depositChain}
          depositWalletBalance={Number(DEPOSIT_WALLET_BALANCE)}
          walletAddress={wallet?.address}
          walletProvider={wallet?.provider}
          confirmedAt={depositConfirmedAt}
          onClose={closeDeposit}
          onAmountChange={setDepositAmount}
          onAmountReview={(nextAmount, nextChain) => {
            setDepositAmount(nextAmount)
            setDepositChain(nextChain)
            setDepositStep('review')
          }}
          onReviewBack={() => setDepositStep('amount')}
          onReviewConfirm={() => setDepositStep('wallet')}
          onWalletComplete={() => setDepositStep('processing')}
          onWalletCancel={() => setDepositStep('review')}
          onProcessingCancel={() => setDepositStep('review')}
          onProcessingComplete={() => {
            setDepositConfirmedAt(Date.now())
            setDepositStep('confirmed')
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
          walletAddress={wallet?.address}
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
          onReviewConfirm={() => setSendStep('wallet')}
          onWalletComplete={() => setSendStep('processing')}
          onWalletCancel={() => setSendStep('review')}
          onProcessingCancel={() => setSendStep('review')}
          onProcessingComplete={() => {
            setSendConfirmedAt(Date.now())
            setSendStep('confirmed')
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
          onProcessingCancel={() => setEarnStep('review')}
          onProcessingComplete={() => {
            setEarnConfirmedAt(Date.now())
            setEarnStep('confirmed')
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
          armadaAddress={DEMO_ARMADA_ADDRESS}
          walletAddress={wallet?.address}
          confirmedAt={withdrawConfirmedAt}
          onClose={closeWithdraw}
          onRecipientChange={setWithdrawRecipient}
          onChainChange={setWithdrawChain}
          onRecipientContinue={() => setWithdrawStep('amount')}
          onAmountChange={setWithdrawAmount}
          onAmountBack={() => setWithdrawStep('recipient')}
          onAmountReview={(nextAmount) => {
            setWithdrawAmount(nextAmount)
            setWithdrawStep('review')
          }}
          onReviewBack={() => setWithdrawStep('amount')}
          onReviewConfirm={() => setWithdrawStep('wallet')}
          onWalletComplete={() => setWithdrawStep('processing')}
          onWalletCancel={() => setWithdrawStep('review')}
          onProcessingCancel={() => setWithdrawStep('review')}
          onProcessingComplete={() => {
            setWithdrawConfirmedAt(Date.now())
            setWithdrawStep('confirmed')
          }}
          onConfirmedGoToDashboard={completeWithdraw}
        />
      ) : null}
    </>
  )
}
