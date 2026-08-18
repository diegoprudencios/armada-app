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
import { createSendActivity } from '@/utils/dashboardActivity'
import { clearPendingPayViaLink, readPendingPayViaLink, type PendingPayViaLink } from '@/utils/payViaLink'
import type { DemoWalletSession } from './useDemoWalletSession'
import type { DemoBalances } from './useDemoBalances'
import type { DashboardActivityState } from './useDashboardActivity'
import type { SendStep } from './types'

export interface UseSendFlowOptions {
  walletSession: DemoWalletSession
  balances: DemoBalances
  activity: DashboardActivityState
}

type SendSnapshot = {
  amount: number
  recipient: string
  chain: SendChainId
  pendingPay: PendingPayViaLink | null
}

const SEND_SETTLE_DELAY_MS = txProcessingSettleDelayMs({
  stageAdvanceMs: DEPOSIT_PROCESSING_STAGE_ADVANCE_MS,
  completedHoldMs: DEPOSIT_PROCESSING_COMPLETED_HOLD_MS,
})

export function useSendFlow({ walletSession, balances, activity }: UseSendFlowOptions) {
  const [sendStep, setSendStepState] = useState<SendStep | null>(null)
  const [sendAmount, setSendAmount] = useState('')
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendChain, setSendChain] = useState<SendChainId>('ethereum')
  const [sendConfirmedAt, setSendConfirmedAt] = useState<number | null>(null)
  const pendingPayViaLinkRef = useRef<PendingPayViaLink | null>(null)
  const snapshotRef = useRef<SendSnapshot | null>(null)
  const ledgerSettledRef = useRef(false)
  const balanceSettledRef = useRef(false)
  const settleTimerRef = useRef<number | null>(null)
  const sendAmountRef = useRef(sendAmount)
  const sendRecipientRef = useRef(sendRecipient)
  const sendChainRef = useRef(sendChain)
  sendAmountRef.current = sendAmount
  sendRecipientRef.current = sendRecipient
  sendChainRef.current = sendChain

  useEffect(() => {
    const pendingPay = readPendingPayViaLink()
    if (!pendingPay || !walletSession.wallet) return

    pendingPayViaLinkRef.current = pendingPay
    setSendRecipient(pendingPay.recipient)
    setSendAmount(pendingPay.amount ?? '')
    setSendChain('ethereum')
    setSendStepState(pendingPay.amount ? 'review' : 'amount')
    clearPendingPayViaLink()
  }, [walletSession.wallet])

  function cancelSettleTimer() {
    if (settleTimerRef.current == null) return
    window.clearTimeout(settleTimerRef.current)
    settleTimerRef.current = null
  }

  function applySendLedger() {
    if (activity.activityReceiptRef.current) return
    if (ledgerSettledRef.current) return

    const snapshot = snapshotRef.current
    if (!snapshot || snapshot.amount <= 0) return

    ledgerSettledRef.current = true

    if (snapshot.pendingPay) return

    activity.prependRecentActivity(createSendActivity(snapshot.amount, snapshot.recipient, snapshot.chain))
  }

  function applySendVisibleBalance() {
    if (activity.activityReceiptRef.current) return
    if (balanceSettledRef.current) return

    const snapshot = snapshotRef.current
    if (!snapshot || snapshot.amount <= 0) return

    balanceSettledRef.current = true

    if (snapshot.pendingPay) {
      activity.settleReceiveLinkPayment(snapshot.pendingPay.requestId, snapshot.amount, snapshot.pendingPay.note)
      pendingPayViaLinkRef.current = null
      return
    }
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

  function armSendSettlement() {
    if (settleTimerRef.current != null) return

    snapshotRef.current = {
      amount: parseActiveAmount(sendAmountRef.current),
      recipient: sendRecipientRef.current,
      chain: sendChainRef.current,
      pendingPay: pendingPayViaLinkRef.current,
    }
    ledgerSettledRef.current = false
    balanceSettledRef.current = false
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null
      applySendLedger()
    }, SEND_SETTLE_DELAY_MS)
  }

  function setSendStep(next: SendStep | null) {
    if (next === 'processing') armSendSettlement()
    setSendStepState(next)
  }

  function resetSendUi() {
    cancelSettleTimer()
    snapshotRef.current = null
    ledgerSettledRef.current = false
    balanceSettledRef.current = false
    pendingPayViaLinkRef.current = null
    setSendStepState(null)
    setSendAmount('')
    setSendRecipient('')
    setSendChain('ethereum')
    setSendConfirmedAt(null)
  }

  useEffect(() => () => cancelSettleTimer(), [])

  function openSend() {
    if (!walletSession.requireWallet()) return
    setSendRecipient('')
    setSendAmount('')
    setSendChain('ethereum')
    setSendStepState('recipient')
  }

  function closeSend() {
    if (activity.activityReceiptRef.current) {
      activity.activityReceiptRef.current = false
      resetSendUi()
      return
    }

    cancelSettleTimer()
    applySendLedger()
    applySendVisibleBalance()
    resetSendUi()
  }

  function completeSend() {
    applySendLedger()
  }

  function openSendConfirmedFromActivity(
    recipient: string,
    chain: SendChainId,
    amountLabel: string,
    confirmedAt: number,
  ) {
    setSendRecipient(recipient)
    setSendChain(chain)
    setSendAmount(amountLabel)
    setSendConfirmedAt(confirmedAt)
    setSendStepState('confirmed')
  }

  return {
    sendStep,
    sendAmount,
    sendRecipient,
    sendChain,
    sendConfirmedAt,
    setSendStep,
    setSendAmount,
    setSendRecipient,
    setSendChain,
    setSendConfirmedAt,
    openSend,
    closeSend,
    completeSend,
    resetSendUi,
    openSendConfirmedFromActivity,
  }
}

export type SendFlow = ReturnType<typeof useSendFlow>
