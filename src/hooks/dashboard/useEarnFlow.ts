import { useRef, useState } from 'react'
import type { EarnTab } from '@/pages/earnFlowConstants'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import { readActivityUserHidden } from '@/utils/demoDashboardSession'
import { createEarnActivity } from '@/utils/dashboardActivity'
import type { DemoWalletSession } from './useDemoWalletSession'
import type { DemoBalances } from './useDemoBalances'
import type { DashboardActivityState } from './useDashboardActivity'
import type { EarnStep } from './types'

export interface UseEarnFlowOptions {
  walletSession: DemoWalletSession
  balances: DemoBalances
  activity: DashboardActivityState
}

export function useEarnFlow({ walletSession, balances, activity }: UseEarnFlowOptions) {
  const [earnStep, setEarnStep] = useState<EarnStep | null>(null)
  const [earnTab, setEarnTab] = useState<EarnTab>('add')
  const [earnAmount, setEarnAmount] = useState('')
  const [earnConfirmedAt, setEarnConfirmedAt] = useState<number | null>(null)
  const pendingEarnRef = useRef<{ amount: number; tab: EarnTab } | null>(null)

  function resetEarnUi() {
    setEarnStep(null)
    setEarnAmount('')
    setEarnTab('add')
    setEarnConfirmedAt(null)
    pendingEarnRef.current = null
  }

  function openEarn(tab: EarnTab = 'add') {
    if (!walletSession.requireWallet()) return
    setEarnTab(tab)
    setEarnAmount('')
    setEarnStep('amount')
  }

  function closeEarn() {
    if (activity.activityReceiptRef.current) {
      activity.activityReceiptRef.current = false
      resetEarnUi()
      return
    }

    setEarnStep(null)
    setEarnAmount('')
    setEarnTab('add')
    setEarnConfirmedAt(null)

    const pending = pendingEarnRef.current
    pendingEarnRef.current = null

    if (!pending || pending.amount <= 0) return

    activity.prependRecentActivity(createEarnActivity(pending.amount, pending.tab))

    const balanceFrom = formatUsdcAmount(balances.dashboardBalance)
    const vaultFrom = formatUsdcAmount(balances.earningBalance)

    if (pending.tab === 'add') {
      balances.setDashboardBalance((prev) => prev - pending.amount)
      balances.setEarningBalance((prev) => prev + pending.amount)
    } else {
      balances.setEarningBalance((prev) => prev - pending.amount)
      balances.setDashboardBalance((prev) => prev + pending.amount)
    }

    balances.setBalanceRoll((roll) => ({
      trigger: roll.trigger + 1,
      mode: 'fromValue',
      fromValue: balanceFrom,
      vaultFromValue: vaultFrom,
    }))

    if (!readActivityUserHidden()) {
      activity.scheduleActivityReveal(activity.activityRevealDelayMs())
    }
  }

  function completeEarn() {
    if (activity.activityReceiptRef.current) return

    const moved = parseActiveAmount(earnAmount)
    if (moved > 0) {
      pendingEarnRef.current = { amount: moved, tab: earnTab }
    }
  }

  function openEarnConfirmedFromActivity(tab: EarnTab, amountLabel: string, confirmedAt: number) {
    setEarnTab(tab)
    setEarnAmount(amountLabel)
    setEarnConfirmedAt(confirmedAt)
    setEarnStep('confirmed')
  }

  const earnSourceBalance = earnTab === 'add' ? balances.dashboardBalance : balances.earningBalance

  return {
    earnStep,
    earnTab,
    earnAmount,
    earnConfirmedAt,
    earnSourceBalance,
    setEarnStep,
    setEarnTab,
    setEarnAmount,
    setEarnConfirmedAt,
    openEarn,
    closeEarn,
    completeEarn,
    resetEarnUi,
    openEarnConfirmedFromActivity,
  }
}

export type EarnFlow = ReturnType<typeof useEarnFlow>
