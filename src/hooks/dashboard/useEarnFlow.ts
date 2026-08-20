import { useEffect, useRef, useState } from 'react'
import { type EarnTab } from '@/pages/earnFlowConstants'
import { txProcessingSettleDelayMs } from '@/constants/txProcessingTiming'
import {
  activityRevealDelayAfterVaultDepositMs,
  vaultWithdrawDashboardHoldMs,
} from '@/components/BalanceCard/balanceRevealMotion'
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

type EarnSnapshot = { amount: number; tab: EarnTab }

const EARN_SETTLE_DELAY_MS = txProcessingSettleDelayMs()

export function useEarnFlow({ walletSession, balances, activity }: UseEarnFlowOptions) {
  const [earnStep, setEarnStepState] = useState<EarnStep | null>(null)
  const [earnTab, setEarnTab] = useState<EarnTab>('add')
  const [earnAmount, setEarnAmount] = useState('')
  const [earnConfirmedAt, setEarnConfirmedAt] = useState<number | null>(null)
  const snapshotRef = useRef<EarnSnapshot | null>(null)
  const ledgerSettledRef = useRef(false)
  const balanceSettledRef = useRef(false)
  const settleTimerRef = useRef<number | null>(null)
  const visibleBalanceTimerRef = useRef<number | null>(null)
  const activityRevealTimerRef = useRef<number | null>(null)
  const earnAmountRef = useRef(earnAmount)
  const earnTabRef = useRef(earnTab)
  earnAmountRef.current = earnAmount
  earnTabRef.current = earnTab

  function cancelSettleTimer() {
    if (settleTimerRef.current == null) return
    window.clearTimeout(settleTimerRef.current)
    settleTimerRef.current = null
  }

  function cancelVisibleBalanceTimer() {
    if (visibleBalanceTimerRef.current == null) return
    window.clearTimeout(visibleBalanceTimerRef.current)
    visibleBalanceTimerRef.current = null
  }

  function cancelActivityRevealTimer() {
    if (activityRevealTimerRef.current == null) return
    window.clearTimeout(activityRevealTimerRef.current)
    activityRevealTimerRef.current = null
  }

  function clearEarnSnapshot() {
    snapshotRef.current = null
    ledgerSettledRef.current = false
    balanceSettledRef.current = false
  }

  function dismissEarnModal() {
    setEarnStepState(null)
    setEarnAmount('')
    setEarnConfirmedAt(null)
  }

  function settleVisibleBalance() {
    applyEarnVisibleBalance()
    clearEarnSnapshot()
    setEarnTab('add')
  }

  function applyEarnLedger() {
    if (activity.activityReceiptRef.current) return
    if (ledgerSettledRef.current) return

    const snapshot = snapshotRef.current
    if (!snapshot || snapshot.amount <= 0) return

    ledgerSettledRef.current = true
  }

  function applyEarnVisibleBalance() {
    if (activity.activityReceiptRef.current) return
    if (balanceSettledRef.current) return

    const snapshot = snapshotRef.current
    if (!snapshot || snapshot.amount <= 0) return

    balanceSettledRef.current = true

    const balanceFrom = formatUsdcAmount(balances.dashboardBalance)
    const vaultFrom = formatUsdcAmount(balances.earningBalance)

    if (snapshot.tab === 'add') {
      balances.setDashboardBalance((prev) => prev - snapshot.amount)
      balances.setEarningBalance((prev) => prev + snapshot.amount)
    } else {
      balances.setEarningBalance((prev) => prev - snapshot.amount)
      balances.setDashboardBalance((prev) => prev + snapshot.amount)
    }

    balances.setBalanceRoll((roll) => ({
      trigger: roll.trigger + 1,
      mode: 'fromValue',
      fromValue: balanceFrom,
      vaultFromValue: vaultFrom,
    }))

    const nextDashboard =
      snapshot.tab === 'add'
        ? balances.dashboardBalance - snapshot.amount
        : balances.dashboardBalance + snapshot.amount
    const nextVault =
      snapshot.tab === 'add'
        ? balances.earningBalance + snapshot.amount
        : balances.earningBalance - snapshot.amount
    const rolledLabel = formatUsdcAmount(Math.max(nextDashboard, nextVault))
    const item = createEarnActivity(snapshot.amount, snapshot.tab)
    if (readActivityUserHidden()) {
      activity.prependRecentActivity(item)
      return
    }

    cancelActivityRevealTimer()
    activityRevealTimerRef.current = window.setTimeout(() => {
      activityRevealTimerRef.current = null
      activity.prependRecentActivity(item)
      activity.scheduleActivityReveal(0)
    }, activityRevealDelayAfterVaultDepositMs(rolledLabel))
  }

  function armEarnSettlement() {
    if (settleTimerRef.current != null) return

    snapshotRef.current = {
      amount: parseActiveAmount(earnAmountRef.current),
      tab: earnTabRef.current,
    }
    ledgerSettledRef.current = false
    balanceSettledRef.current = false
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null
      applyEarnLedger()
    }, EARN_SETTLE_DELAY_MS)
  }

  function setEarnStep(next: EarnStep | null) {
    if (next === 'processing') armEarnSettlement()
    setEarnStepState(next)
  }

  function resetEarnUi() {
    cancelSettleTimer()
    cancelVisibleBalanceTimer()
    cancelActivityRevealTimer()
    clearEarnSnapshot()
    setEarnStepState(null)
    setEarnAmount('')
    setEarnTab('add')
    setEarnConfirmedAt(null)
  }

  useEffect(
    () => () => {
      cancelSettleTimer()
      cancelVisibleBalanceTimer()
      cancelActivityRevealTimer()
    },
    [],
  )

  function openEarn(tab: EarnTab = 'add') {
    if (!walletSession.requireWallet()) return
    cancelVisibleBalanceTimer()
    settleVisibleBalance()
    setEarnTab(tab)
    setEarnAmount('')
    setEarnStepState('amount')
  }

  function closeEarn() {
    if (activity.activityReceiptRef.current) {
      activity.activityReceiptRef.current = false
      resetEarnUi()
      return
    }

    cancelSettleTimer()
    applyEarnLedger()
    dismissEarnModal()

    const holdMs = snapshotRef.current ? vaultWithdrawDashboardHoldMs() : 0

    if (holdMs <= 0) {
      settleVisibleBalance()
      return
    }

    visibleBalanceTimerRef.current = window.setTimeout(() => {
      visibleBalanceTimerRef.current = null
      settleVisibleBalance()
    }, holdMs)
  }

  function completeEarn() {
    applyEarnLedger()
  }

  function openEarnConfirmedFromActivity(tab: EarnTab, amountLabel: string, confirmedAt: number) {
    setEarnTab(tab)
    setEarnAmount(amountLabel)
    setEarnConfirmedAt(confirmedAt)
    setEarnStepState('confirmed')
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
