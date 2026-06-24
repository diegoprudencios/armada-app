import { ConnectWalletOverlay } from '@/components/ConnectWalletOverlay'
import type { useDashboardDemoState } from '@/hooks/useDashboardDemoState'
import { DEPOSIT_WALLET_BALANCE, DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import { DepositModalFlow } from './DepositModalFlow'
import { SendModalFlow } from './SendModalFlow'

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
    sendStep,
    sendAmount,
    sendRecipient,
    sendChain,
    dashboardBalance,
    connectWallet,
    closeDeposit,
    completeDeposit,
    closeSend,
    completeSend,
    setDepositAmount,
    setDepositChain,
    setDepositStep,
    setSendAmount,
    setSendRecipient,
    setSendChain,
    setSendStep,
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
          onProcessingComplete={() => setDepositStep('confirmed')}
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
          onProcessingComplete={() => setSendStep('confirmed')}
          onConfirmedGoToDashboard={completeSend}
        />
      ) : null}
    </>
  )
}
