import { ConnectWalletOverlay } from '@/components/ConnectWalletOverlay'
import type { useDashboardDemoState } from '@/hooks/useDashboardDemoState'
import { DEPOSIT_WALLET_BALANCE } from './depositFlowConstants'
import { DepositModalFlow } from './DepositModalFlow'

type DashboardDemoState = ReturnType<typeof useDashboardDemoState>

export interface DashboardOverlaysProps {
  state: DashboardDemoState
}

/** Connect wallet + deposit modal flows shared by all dashboard layout variants. */
export function DashboardOverlays({ state }: DashboardOverlaysProps) {
  const {
    wallet,
    connectOpen,
    depositStep,
    depositAmount,
    depositChain,
    connectWallet,
    closeDeposit,
    completeDeposit,
    setDepositAmount,
    setDepositChain,
    setDepositStep,
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
    </>
  )
}
