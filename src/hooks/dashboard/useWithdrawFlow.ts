import { useEffect, useRef, useState } from 'react'
import type { SendChainId } from '@/pages/sendFlowConstants'
import {
  DEPOSIT_PROCESSING_COMPLETED_HOLD_MS,
  DEPOSIT_PROCESSING_STAGE_ADVANCE_MS,
  txProcessingSettleDelayMs,
} from '@/constants/txProcessingTiming'
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

type WithdrawSnapshot = { amount: number; chain: SendChainId; recipient: string }

const WITHDRAW_SETTLE_DELAY_MS = txProcessingSettleDelayMs({
  stageAdvanceMs: DEPOSIT_PROCESSING_STAGE_ADVANCE_MS,
  completedHoldMs: DEPOSIT_PROCESSING_COMPLETED_HOLD_MS,
})

export function useWithdrawFlow({ walletSession, balances, activity }: UseWithdrawFlowOptions) {
  const [withdrawStep, setWithdrawStepState] = useState<WithdrawStep | null>(null)
  const [withdrawRecipient, setWithdrawRecipient] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawChain, setWithdrawChain] = useState<SendChainId>('ethereum')
  const [withdrawConfirmedAt, setWithdrawConfirmedAt] = useState<number | null>(null)
  const [withdrawSkipRecipient, setWithdrawSkipRecipient] = useState(false)
  const [withdrawSkipEnter, setWithdrawSkipEnter] = useState(false)
  const snapshotRef = useRef<WithdrawSnapshot | null>(null)
  const ledgerSettledRef = useRef(false)
  const balanceSettledRef = useRef(false)
  const settleTimerRef = useRef<number | null>(null)
  const withdrawAmountRef = useRef(withdrawAmount)
  const withdrawChainRef = useRef(withdrawChain)
  const withdrawRecipientRef = useRef(withdrawRecipient)
  withdrawAmountRef.current = withdrawAmount
  withdrawChainRef.current = withdrawChain
  withdrawRecipientRef.current = withdrawRecipient

  function cancelSettleTimer() {
    if (settleTimerRef.current == null) return
    window.clearTimeout(settleTimerRef.current)
    settleTimerRef.current = null
  }

  function applyWithdrawLedger() {
    if (activity.activityReceiptRef.current) return
    if (ledgerSettledRef.current) return

    const snapshot = snapshotRef.current
    if (!snapshot || snapshot.amount <= 0) return

    ledgerSettledRef.current = true
    activity.prependRecentActivity(createWithdrawActivity(snapshot.amount, snapshot.chain, snapshot.recipient))
    const ownWalletAddress = walletSession.wallet?.address
    if (
      ownWalletAddress &&
      snapshot.recipient.toLowerCase() === ownWalletAddress.toLowerCase()
    ) {
      walletSession.adjustActiveWalletUsdc(snapshot.amount)
    }
  }

  function applyWithdrawVisibleBalance() {
    if (activity.activityReceiptRef.current) return
    if (balanceSettledRef.current) return

    const snapshot = snapshotRef.current
    if (!snapshot || snapshot.amount <= 0) return

    balanceSettledRef.current = true
    balances.setDashboardBalance((prev) => {
      balances.setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue: formatUsdcAmount(prev),
      }))
      if (!readActivityUserHidden()) {
        activity.scheduleActivityReveal(activity.activityRevealDelayMs())
      }
      return prev - snapshot.amount
    })
  }

  function armWithdrawSettlement() {
    if (settleTimerRef.current != null) return

    snapshotRef.current = {
      amount: parseActiveAmount(withdrawAmountRef.current),
      chain: withdrawChainRef.current,
      recipient: withdrawRecipientRef.current,
    }
    ledgerSettledRef.current = false
    balanceSettledRef.current = false
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null
      applyWithdrawLedger()
    }, WITHDRAW_SETTLE_DELAY_MS)
  }

  function setWithdrawStep(next: WithdrawStep | null) {
    if (next === 'processing') armWithdrawSettlement()
    setWithdrawStepState(next)
  }

  function resetWithdrawUi() {
    cancelSettleTimer()
    snapshotRef.current = null
    ledgerSettledRef.current = false
    balanceSettledRef.current = false
    setWithdrawStepState(null)
    setWithdrawRecipient('')
    setWithdrawAmount('')
    setWithdrawChain('ethereum')
    setWithdrawConfirmedAt(null)
    setWithdrawSkipRecipient(false)
    setWithdrawSkipEnter(false)
  }

  useEffect(() => () => cancelSettleTimer(), [])

  function openWithdraw() {
    if (!walletSession.requireWallet()) return
    if (balances.dashboardBalance <= 0) return
    setWithdrawRecipient(walletSession.wallet!.address)
    setWithdrawAmount('')
    setWithdrawChain('ethereum')
    setWithdrawSkipRecipient(false)
    setWithdrawSkipEnter(false)
    setWithdrawStepState('recipient')
  }

  /** Unshield tab: skip recipient — destination is the connected wallet. */
  function openUnshield(initialAmount = '') {
    if (!walletSession.requireWallet()) return
    setWithdrawRecipient(walletSession.wallet!.address)
    setWithdrawAmount(initialAmount)
    setWithdrawChain('ethereum')
    setWithdrawSkipRecipient(true)
    setWithdrawSkipEnter(false)
    setWithdrawStepState('amount')
  }

  function openUnshieldReview(amount: string) {
    if (!walletSession.requireWallet()) return
    setWithdrawRecipient(walletSession.wallet!.address)
    setWithdrawAmount(amount)
    setWithdrawChain('ethereum')
    setWithdrawSkipRecipient(true)
    setWithdrawSkipEnter(true)
    setWithdrawStepState('review')
  }

  function closeWithdraw() {
    if (activity.activityReceiptRef.current) {
      activity.activityReceiptRef.current = false
      resetWithdrawUi()
      return
    }

    cancelSettleTimer()
    applyWithdrawLedger()
    applyWithdrawVisibleBalance()
    resetWithdrawUi()
  }

  function completeWithdraw() {
    applyWithdrawLedger()
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
    setWithdrawStepState('confirmed')
  }

  return {
    withdrawStep,
    withdrawRecipient,
    withdrawAmount,
    withdrawChain,
    withdrawConfirmedAt,
    withdrawSkipRecipient,
    withdrawSkipEnter,
    setWithdrawStep,
    setWithdrawRecipient,
    setWithdrawAmount,
    setWithdrawChain,
    setWithdrawConfirmedAt,
    openWithdraw,
    openUnshield,
    openUnshieldReview,
    closeWithdraw,
    completeWithdraw,
    resetWithdrawUi,
    openWithdrawConfirmedFromActivity,
  }
}

export type WithdrawFlow = ReturnType<typeof useWithdrawFlow>
