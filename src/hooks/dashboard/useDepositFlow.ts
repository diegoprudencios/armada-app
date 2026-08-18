import { useEffect, useRef, useState } from 'react'
import type { DepositChainId } from '@/constants/depositChains'
import {
  DEPOSIT_PROCESSING_COMPLETED_HOLD_MS,
  DEPOSIT_PROCESSING_STAGE_ADVANCE_MS,
  txProcessingSettleDelayMs,
} from '@/constants/txProcessingTiming'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import { createDepositActivity } from '@/utils/dashboardActivity'
import { depositTotalCost } from '@/utils/depositFee'
import { readActivityUserHidden } from '@/utils/demoDashboardSession'
import type { DemoWalletSession } from './useDemoWalletSession'
import type { DemoBalances } from './useDemoBalances'
import type { DashboardActivityState } from './useDashboardActivity'
import type { DepositStep } from './types'

export interface UseDepositFlowOptions {
  walletSession: DemoWalletSession
  balances: DemoBalances
  activity: DashboardActivityState
}

type DepositSnapshot = { amount: number; chain: DepositChainId }

const DEPOSIT_SETTLE_DELAY_MS = txProcessingSettleDelayMs({
  stageAdvanceMs: DEPOSIT_PROCESSING_STAGE_ADVANCE_MS,
  completedHoldMs: DEPOSIT_PROCESSING_COMPLETED_HOLD_MS,
})

export function useDepositFlow({ walletSession, balances, activity }: UseDepositFlowOptions) {
  const [depositStep, setDepositStepState] = useState<DepositStep | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositChain, setDepositChain] = useState<DepositChainId>('sepolia')
  const [depositConfirmedAt, setDepositConfirmedAt] = useState<number | null>(null)
  const [depositSkipEnter, setDepositSkipEnter] = useState(false)
  const snapshotRef = useRef<DepositSnapshot | null>(null)
  const settledRef = useRef(false)
  const settleTimerRef = useRef<number | null>(null)
  const depositAmountRef = useRef(depositAmount)
  const depositChainRef = useRef(depositChain)
  depositAmountRef.current = depositAmount
  depositChainRef.current = depositChain

  function cancelSettleTimer() {
    if (settleTimerRef.current == null) return
    window.clearTimeout(settleTimerRef.current)
    settleTimerRef.current = null
  }

  function applyDepositSettlement() {
    if (activity.activityReceiptRef.current) return
    if (settledRef.current) return

    const snapshot = snapshotRef.current
    if (!snapshot || snapshot.amount <= 0) return

    settledRef.current = true
    balances.setHasCompletedDeposit(true)
    activity.prependRecentActivity(createDepositActivity(snapshot.amount, snapshot.chain))
    walletSession.adjustActiveWalletUsdc(-depositTotalCost(snapshot.amount))
    balances.setDashboardBalance((prev) => {
      const next = prev + snapshot.amount
      balances.setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue: formatUsdcAmount(prev),
      }))
      if (!readActivityUserHidden()) {
        activity.scheduleActivityReveal(activity.activityRevealDelayAfterRollMs(formatUsdcAmount(next)))
      }
      return next
    })
  }

  function armDepositSettlement() {
    if (settleTimerRef.current != null) return

    const amount = parseActiveAmount(depositAmountRef.current)
    snapshotRef.current = { amount, chain: depositChainRef.current }
    settledRef.current = false
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null
      applyDepositSettlement()
    }, DEPOSIT_SETTLE_DELAY_MS)
  }

  function setDepositStep(next: DepositStep | null) {
    if (next === 'processing') armDepositSettlement()
    setDepositStepState(next)
  }

  function resetDepositUi() {
    cancelSettleTimer()
    snapshotRef.current = null
    settledRef.current = false
    setDepositStepState(null)
    setDepositAmount('')
    setDepositChain('sepolia')
    setDepositConfirmedAt(null)
    setDepositSkipEnter(false)
  }

  function hideDepositUi() {
    setDepositStepState(null)
    setDepositAmount('')
    setDepositChain('sepolia')
    setDepositConfirmedAt(null)
    setDepositSkipEnter(false)
  }

  useEffect(() => () => cancelSettleTimer(), [])

  function openDeposit() {
    openDepositWithAmount('')
  }

  function openDepositWithAmount(initialAmount: string) {
    if (!walletSession.requireWallet()) return
    setDepositSkipEnter(false)
    setDepositAmount(initialAmount)
    setDepositChain('sepolia')
    setDepositStepState('amount')
  }

  function openDepositReview(amount: string) {
    if (!walletSession.requireWallet()) return
    setDepositSkipEnter(true)
    setDepositAmount(amount)
    setDepositChain('sepolia')
    setDepositStepState('review')
  }

  function openDepositFromWallet(walletId: string, chain: DepositChainId) {
    if (!walletSession.activateWallet(walletId)) return
    setDepositSkipEnter(false)
    setDepositAmount('')
    setDepositChain(chain)
    setDepositStepState('amount')
  }

  function closeDeposit() {
    if (activity.activityReceiptRef.current) {
      activity.activityReceiptRef.current = false
      resetDepositUi()
      return
    }

    if (settleTimerRef.current != null) {
      hideDepositUi()
      return
    }

    applyDepositSettlement()
    resetDepositUi()
  }

  function completeDeposit() {
    applyDepositSettlement()
  }

  function openDepositConfirmedFromActivity(
    chain: DepositChainId,
    amountLabel: string,
    confirmedAt: number,
  ) {
    setDepositChain(chain)
    setDepositAmount(amountLabel)
    setDepositConfirmedAt(confirmedAt)
    setDepositStepState('confirmed')
  }

  return {
    depositStep,
    depositAmount,
    depositChain,
    depositConfirmedAt,
    depositSkipEnter,
    setDepositStep,
    setDepositAmount,
    setDepositChain,
    setDepositConfirmedAt,
    openDeposit,
    openDepositWithAmount,
    openDepositReview,
    openDepositFromWallet,
    closeDeposit,
    completeDeposit,
    resetDepositUi,
    openDepositConfirmedFromActivity,
  }
}

export type DepositFlow = ReturnType<typeof useDepositFlow>
