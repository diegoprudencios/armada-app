import { useEffect, useRef } from 'react'
import { useEnvironment } from '@/hooks/useEnvironment'
import { writeDemoDashboardSession } from '@/utils/demoDashboardSession'
import { returnToLanding } from '@/utils/appNavigation'
import type { DashboardActivityItem } from '@/constants/dashboardActivity'
import { resolveActivityTxHash } from '@/utils/dashboardActivity'
import { useDemoWalletSession } from './dashboard/useDemoWalletSession'
import { useDemoBalances } from './dashboard/useDemoBalances'
import { useDashboardActivity } from './dashboard/useDashboardActivity'
import { useDepositFlow } from './dashboard/useDepositFlow'
import { useSendFlow } from './dashboard/useSendFlow'
import { useEarnFlow } from './dashboard/useEarnFlow'
import { useWithdrawFlow } from './dashboard/useWithdrawFlow'
import { useRequestFlow } from './dashboard/useRequestFlow'

export type {
  DepositStep,
  SendStep,
  EarnStep,
  WithdrawStep,
  RequestStep,
  ReceivePaymentStep,
} from './dashboard/types'

export function useDashboardDemoState(initialBalance = 0) {
  const [environment] = useEnvironment()
  const isMock = environment === 'mock'

  const balancesRef = useRef<{ creditBalanceIncrease: (amount: number) => void; ensureBalanceAtLeast: (amount: number) => void } | null>(null)

  const activity = useDashboardActivity(isMock, {
    creditBalanceIncrease: (amount) => balancesRef.current?.creditBalanceIncrease(amount),
    ensureBalanceAtLeast: (amount) => balancesRef.current?.ensureBalanceAtLeast(amount),
  })

  const balances = useDemoBalances({
    initialBalance,
    scheduleActivityReveal: activity.scheduleActivityReveal,
  })

  balancesRef.current = {
    creditBalanceIncrease: balances.creditBalanceIncrease,
    ensureBalanceAtLeast: balances.ensureBalanceAtLeast,
  }

  const walletSession = useDemoWalletSession({
    onFullSessionReset: () => {
      resetDashboardSession()
    },
  })

  const deposit = useDepositFlow({ walletSession, balances, activity })
  const send = useSendFlow({ walletSession, balances, activity })
  const earn = useEarnFlow({ walletSession, balances, activity })
  const withdraw = useWithdrawFlow({ walletSession, balances, activity })
  const request = useRequestFlow({ walletSession, activity })

  function resetDashboardSession() {
    activity.clearAllLinkPaymentTimers()
    walletSession.clearWalletState()
    balances.resetBalances(initialBalance)
    activity.resetActivity()
    deposit.resetDepositUi()
    send.resetSendUi()
    earn.resetEarnUi()
    withdraw.resetWithdrawUi()
    request.resetRequestUi()
    request.resetReceivePaymentUi()
    returnToLanding()
  }

  useEffect(() => {
    if (!isMock) return
    writeDemoDashboardSession({
      wallet: walletSession.wallet,
      connectedWallets: walletSession.connectedWallets,
      activeWalletId: walletSession.activeWalletId,
      balance: balances.dashboardBalance,
      earningBalance: balances.earningBalance,
      hasCompletedDeposit: balances.hasCompletedDeposit,
      recentActivity: activity.recentActivity,
    })
  }, [
    isMock,
    walletSession.wallet,
    walletSession.connectedWallets,
    walletSession.activeWalletId,
    balances.dashboardBalance,
    balances.earningBalance,
    balances.hasCompletedDeposit,
    activity.recentActivity,
  ])

  const showDepositTooltip =
    Boolean(walletSession.wallet) &&
    !balances.hasCompletedDeposit &&
    balances.dashboardBalance <= 0

  function openActivityReceipt(item: DashboardActivityItem) {
    if (!walletSession.wallet) return

    activity.activityReceiptRef.current = true

    const amountLabel = String(Math.abs(item.amount))

    switch (item.kind) {
      case 'send':
        send.openSendConfirmedFromActivity(item.recipient, item.chain, amountLabel, item.occurredAt)
        return
      case 'deposit':
        deposit.openDepositConfirmedFromActivity(item.chain, amountLabel, item.occurredAt)
        return
      case 'earn':
        earn.openEarnConfirmedFromActivity(item.tab, amountLabel, item.occurredAt)
        return
      case 'withdraw':
        withdraw.openWithdrawConfirmedFromActivity(
          item.recipient,
          item.chain,
          amountLabel,
          item.occurredAt,
        )
        return
      case 'requestLink': {
        if (item.status === 'paid') {
          request.openRequestReceiptFromActivity(
            item.requestId,
            item.paidAmount ?? item.requestedAmount,
            item.note,
            item.paidAt ?? item.occurredAt,
            item.txHash ?? resolveActivityTxHash(item),
          )
          return
        }
        request.openRequestShareFromActivity(item)
        return
      }
      case 'receiveLink':
        request.openRequestReceiptFromReceiveLink(item)
        return
      case 'receive':
        request.openReceivePaymentReceiptFromActivity(
          item.sender,
          item.amount,
          item.chain,
          item.occurredAt,
          item.txHash,
        )
        return
      default:
        activity.activityReceiptRef.current = false
    }
  }

  return {
    wallet: walletSession.wallet,
    connectedWallets: walletSession.connectedWallets,
    activeWalletId: walletSession.activeWalletId,
    dashboardBalance: balances.dashboardBalance,
    hasCompletedDeposit: balances.hasCompletedDeposit,
    connectOpen: walletSession.connectOpen,
    depositStep: deposit.depositStep,
    depositAmount: deposit.depositAmount,
    depositChain: deposit.depositChain,
    depositConfirmedAt: deposit.depositConfirmedAt,
    sendStep: send.sendStep,
    sendAmount: send.sendAmount,
    sendRecipient: send.sendRecipient,
    sendChain: send.sendChain,
    sendConfirmedAt: send.sendConfirmedAt,
    earnStep: earn.earnStep,
    earnTab: earn.earnTab,
    earnAmount: earn.earnAmount,
    earnConfirmedAt: earn.earnConfirmedAt,
    withdrawStep: withdraw.withdrawStep,
    withdrawRecipient: withdraw.withdrawRecipient,
    withdrawAmount: withdraw.withdrawAmount,
    withdrawChain: withdraw.withdrawChain,
    withdrawConfirmedAt: withdraw.withdrawConfirmedAt,
    requestStep: request.requestStep,
    requestAmount: request.requestAmount,
    requestNote: request.requestNote,
    requestExpiryId: request.requestExpiryId,
    requestPaymentLink: request.requestPaymentLink,
    requestId: request.requestId,
    requestExpiresAt: request.requestExpiresAt,
    requestLinkRevoked: request.requestLinkRevoked,
    requestConfirmedAt: request.requestConfirmedAt,
    requestReceiptTxHash: request.requestReceiptTxHash,
    receivePaymentStep: request.receivePaymentStep,
    receivePaymentAmount: request.receivePaymentAmount,
    receivePaymentSender: request.receivePaymentSender,
    receivePaymentChain: request.receivePaymentChain,
    receivePaymentConfirmedAt: request.receivePaymentConfirmedAt,
    receivePaymentTxHash: request.receivePaymentTxHash,
    earningBalance: balances.earningBalance,
    activityVisible: activity.activityVisible,
    recentActivity: activity.recentActivity,
    balanceHidden: balances.balanceHidden,
    earnSourceBalance: earn.earnSourceBalance,
    balanceRoll: balances.balanceRoll,
    showDepositTooltip,
    openConnect: walletSession.openConnect,
    dismissConnect: walletSession.dismissConnect,
    connectWallet: walletSession.connectWallet,
    selectActiveWallet: walletSession.selectActiveWallet,
    disconnectWallet: walletSession.disconnectWallet,
    openDeposit: deposit.openDeposit,
    openDepositFromWallet: deposit.openDepositFromWallet,
    closeDeposit: deposit.closeDeposit,
    completeDeposit: deposit.completeDeposit,
    openSend: send.openSend,
    closeSend: send.closeSend,
    completeSend: send.completeSend,
    openEarn: earn.openEarn,
    closeEarn: earn.closeEarn,
    completeEarn: earn.completeEarn,
    openWithdraw: withdraw.openWithdraw,
    closeWithdraw: withdraw.closeWithdraw,
    completeWithdraw: withdraw.completeWithdraw,
    openRequest: request.openRequest,
    closeRequest: request.closeRequest,
    completeRequestLink: request.completeRequestLink,
    markRequestLinkRevoked: request.markRequestLinkRevoked,
    closeReceivePayment: request.closeReceivePayment,
    setDepositAmount: deposit.setDepositAmount,
    setDepositChain: deposit.setDepositChain,
    setDepositStep: deposit.setDepositStep,
    setDepositConfirmedAt: deposit.setDepositConfirmedAt,
    setSendAmount: send.setSendAmount,
    setSendRecipient: send.setSendRecipient,
    setSendChain: send.setSendChain,
    setSendStep: send.setSendStep,
    setSendConfirmedAt: send.setSendConfirmedAt,
    setEarnTab: earn.setEarnTab,
    setEarnAmount: earn.setEarnAmount,
    setEarnStep: earn.setEarnStep,
    setEarnConfirmedAt: earn.setEarnConfirmedAt,
    setWithdrawRecipient: withdraw.setWithdrawRecipient,
    setWithdrawAmount: withdraw.setWithdrawAmount,
    setWithdrawChain: withdraw.setWithdrawChain,
    setWithdrawStep: withdraw.setWithdrawStep,
    setWithdrawConfirmedAt: withdraw.setWithdrawConfirmedAt,
    setRequestAmount: request.setRequestAmount,
    setRequestNote: request.setRequestNote,
    setRequestExpiryId: request.setRequestExpiryId,
    setRequestStep: request.setRequestStep,
    setBalanceHidden: balances.setBalanceHidden,
    toggleActivity: activity.toggleActivity,
    openActivityReceipt,
  }
}
