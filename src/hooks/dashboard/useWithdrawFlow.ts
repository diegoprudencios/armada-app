import { useRef, useState } from 'react'
import type { SendChainId } from '@/pages/sendFlowConstants'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import { readActivityUserHidden } from '@/utils/demoDashboardSession'
import { createWithdrawActivity } from '@/utils/dashboardActivity'
import type { DemoWalletSession } from './useDemoWalletSession'
import type { DemoBalances } from './useDemoBalances'
import type { DashboardActivityState } from './useDashboardActivity'
import type { WithdrawStep } from './types'

export interface UseWithdrawFlowOptions {
  walletSession: DemoWalletSession
  balances: DemoBalances
  activity: DashboardActivityState
}

export function useWithdrawFlow({ walletSession, balances, activity }: UseWithdrawFlowOptions) {
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep | null>(null)
  const [withdrawRecipient, setWithdrawRecipient] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawChain, setWithdrawChain] = useState<SendChainId>('ethereum')
  const [withdrawConfirmedAt, setWithdrawConfirmedAt] = useState<number | null>(null)
  const pendingWithdrawRef = useRef(0)

  function resetWithdrawUi() {
    setWithdrawStep(null)
    setWithdrawRecipient('')
    setWithdrawAmount('')
    setWithdrawChain('ethereum')
    setWithdrawConfirmedAt(null)
    pendingWithdrawRef.current = 0
  }

  function openWithdraw() {
    if (!walletSession.requireWallet()) return
    if (balances.dashboardBalance <= 0) return
    setWithdrawRecipient(walletSession.wallet!.address)
    setWithdrawAmount('')
    setWithdrawChain('ethereum')
    setWithdrawStep('recipient')
  }

  function closeWithdraw() {
    if (activity.activityReceiptRef.current) {
      activity.activityReceiptRef.current = false
      resetWithdrawUi()
      return
    }

    const withdrawn = pendingWithdrawRef.current
    const chain = withdrawChain
    const recipient = withdrawRecipient
    pendingWithdrawRef.current = 0
    setWithdrawStep(null)
    setWithdrawRecipient('')
    setWithdrawAmount('')
    setWithdrawChain('ethereum')
    setWithdrawConfirmedAt(null)

    if (withdrawn > 0) {
      activity.prependRecentActivity(createWithdrawActivity(withdrawn, chain, recipient))
      const fromValue = formatUsdcAmount(balances.dashboardBalance)
      balances.setDashboardBalance((prev) => prev - withdrawn)
      balances.setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue,
      }))
      if (!readActivityUserHidden()) {
        activity.scheduleActivityReveal(activity.activityRevealDelayMs())
      }
    }
  }

  function completeWithdraw() {
    if (activity.activityReceiptRef.current) return

    const withdrawn = parseActiveAmount(withdrawAmount)
    if (withdrawn > 0) {
      pendingWithdrawRef.current = withdrawn
    }
  }

  function openWithdrawConfirmedFromActivity(
    recipient: string,
    chain: SendChainId,
    amountLabel: string,
    confirmedAt: number,
  ) {
    setWithdrawRecipient(recipient)
    setWithdrawChain(chain)
    setWithdrawAmount(amountLabel)
    setWithdrawConfirmedAt(confirmedAt)
    setWithdrawStep('confirmed')
  }

  return {
    withdrawStep,
    withdrawRecipient,
    withdrawAmount,
    withdrawChain,
    withdrawConfirmedAt,
    setWithdrawStep,
    setWithdrawRecipient,
    setWithdrawAmount,
    setWithdrawChain,
    setWithdrawConfirmedAt,
    openWithdraw,
    closeWithdraw,
    completeWithdraw,
    resetWithdrawUi,
    openWithdrawConfirmedFromActivity,
  }
}

export type WithdrawFlow = ReturnType<typeof useWithdrawFlow>
