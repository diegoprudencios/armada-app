import { useState } from 'react'
import type { SendChainId } from '@/pages/sendFlowConstants'
import {
  DEFAULT_REQUEST_LINK_EXPIRY_ID,
  shouldOpenRequestChooser,
  type RequestLinkExpiryId,
} from '@/pages/requestFlowConstants'
import { parseActiveAmount } from '@/utils/amountInput'
import { readActivityUserHidden } from '@/utils/demoDashboardSession'
import { createRequestLinkActivity, findRequestLinkActivity } from '@/utils/dashboardActivity'
import { isPaymentLinkRevoked } from '@/utils/payViaLink'
import type { DashboardActivityItem } from '@/constants/dashboardActivity'
import type { DemoWalletSession } from './useDemoWalletSession'
import type { DashboardActivityState } from './useDashboardActivity'
import type { ReceivePaymentStep, RequestStep } from './types'

export interface UseRequestFlowOptions {
  walletSession: DemoWalletSession
  activity: DashboardActivityState
}

export function useRequestFlow({ walletSession, activity }: UseRequestFlowOptions) {
  const [requestStep, setRequestStep] = useState<RequestStep | null>(null)
  const [requestAmount, setRequestAmount] = useState('')
  const [requestNote, setRequestNote] = useState('')
  const [requestExpiryId, setRequestExpiryId] = useState<RequestLinkExpiryId>(DEFAULT_REQUEST_LINK_EXPIRY_ID)
  const [requestPaymentLink, setRequestPaymentLink] = useState('')
  const [requestId, setRequestId] = useState('')
  const [requestExpiresAt, setRequestExpiresAt] = useState(0)
  const [requestLinkRevoked, setRequestLinkRevoked] = useState(false)
  const [requestConfirmedAt, setRequestConfirmedAt] = useState<number | null>(null)
  const [requestReceiptTxHash, setRequestReceiptTxHash] = useState('')

  const [receivePaymentStep, setReceivePaymentStep] = useState<ReceivePaymentStep | null>(null)
  const [receivePaymentAmount, setReceivePaymentAmount] = useState('')
  const [receivePaymentSender, setReceivePaymentSender] = useState('')
  const [receivePaymentChain, setReceivePaymentChain] = useState<SendChainId>('ethereum')
  const [receivePaymentConfirmedAt, setReceivePaymentConfirmedAt] = useState<number | null>(null)
  const [receivePaymentTxHash, setReceivePaymentTxHash] = useState('')

  function resetRequestUi() {
    setRequestStep(null)
    setRequestAmount('')
    setRequestNote('')
    setRequestExpiryId(DEFAULT_REQUEST_LINK_EXPIRY_ID)
    setRequestPaymentLink('')
    setRequestId('')
    setRequestExpiresAt(0)
    setRequestLinkRevoked(false)
    setRequestConfirmedAt(null)
    setRequestReceiptTxHash('')
  }

  function resetReceivePaymentUi() {
    setReceivePaymentStep(null)
    setReceivePaymentAmount('')
    setReceivePaymentSender('')
    setReceivePaymentChain('ethereum')
    setReceivePaymentConfirmedAt(null)
    setReceivePaymentTxHash('')
  }

  function openRequest() {
    if (!walletSession.requireWallet()) return
    setRequestAmount('')
    setRequestNote('')
    setRequestExpiryId(DEFAULT_REQUEST_LINK_EXPIRY_ID)
    setRequestPaymentLink('')
    setRequestId('')
    setRequestExpiresAt(0)
    setRequestLinkRevoked(false)
    setRequestStep(shouldOpenRequestChooser() ? 'choose' : 'receive')
  }

  function closeRequest() {
    if (activity.activityReceiptRef.current) {
      activity.activityReceiptRef.current = false
      resetRequestUi()
      return
    }

    resetRequestUi()
  }

  function completeRequestLink(payload: {
    paymentLink: string
    requestId: string
    expiresAt: number
  }) {
    setRequestPaymentLink(payload.paymentLink)
    setRequestId(payload.requestId)
    setRequestExpiresAt(payload.expiresAt)
    setRequestLinkRevoked(false)
    setRequestStep('link')

    const requestedAmount = parseActiveAmount(requestAmount)
    const trimmedNote = requestNote.trim()
    activity.prependRecentActivity(
      createRequestLinkActivity({
        requestId: payload.requestId,
        paymentLink: payload.paymentLink,
        expiresAt: payload.expiresAt,
        requestedAmount,
        note: trimmedNote || undefined,
      }),
    )

    activity.scheduleRequestLinkPaymentDemo({
      requestId: payload.requestId,
      paidAmount: requestedAmount,
      note: trimmedNote || undefined,
    })

    if (!readActivityUserHidden()) {
      activity.scheduleActivityReveal(activity.activityRevealDelayMs())
    }
  }

  function markRequestLinkRevoked() {
    setRequestLinkRevoked(true)
    if (!requestId) return
    activity.markRequestLinkRevoked(requestId)
  }

  function openReceivePaymentReceiptFromActivity(
    sender: string,
    amount: number,
    chain: SendChainId,
    confirmedAt: number,
    txHash: string,
  ) {
    setReceivePaymentAmount(amount > 0 ? String(amount) : '')
    setReceivePaymentSender(sender)
    setReceivePaymentChain(chain)
    setReceivePaymentConfirmedAt(confirmedAt)
    setReceivePaymentTxHash(txHash)
    setReceivePaymentStep('confirmed')
  }

  function closeReceivePayment() {
    if (activity.activityReceiptRef.current) {
      activity.activityReceiptRef.current = false
      resetReceivePaymentUi()
      return
    }

    resetReceivePaymentUi()
  }

  function openRequestReceiptFromActivity(
    requestIdValue: string,
    paidAmount: number,
    note: string | undefined,
    confirmedAt: number,
    txHash: string,
  ) {
    setRequestAmount(paidAmount > 0 ? String(paidAmount) : '')
    setRequestNote(note ?? '')
    setRequestId(requestIdValue)
    setRequestConfirmedAt(confirmedAt)
    setRequestReceiptTxHash(txHash)
    setRequestStep('confirmed')
  }

  function openRequestShareFromActivity(item: Extract<DashboardActivityItem, { kind: 'requestLink' }>) {
    setRequestAmount(item.requestedAmount > 0 ? String(item.requestedAmount) : '')
    setRequestNote(item.note ?? '')
    setRequestPaymentLink(item.paymentLink)
    setRequestId(item.requestId)
    setRequestExpiresAt(item.expiresAt)
    setRequestLinkRevoked(item.status === 'revoked' || isPaymentLinkRevoked(item.requestId))
    setRequestStep('link')
  }

  function openRequestReceiptFromReceiveLink(item: Extract<DashboardActivityItem, { kind: 'receiveLink' }>) {
    const linkedRequest = findRequestLinkActivity(activity.recentActivity, item.requestId)
    openRequestReceiptFromActivity(
      item.requestId,
      item.paidAmount,
      item.note ?? linkedRequest?.note,
      item.occurredAt,
      item.txHash,
    )
  }

  return {
    requestStep,
    requestAmount,
    requestNote,
    requestExpiryId,
    requestPaymentLink,
    requestId,
    requestExpiresAt,
    requestLinkRevoked,
    requestConfirmedAt,
    requestReceiptTxHash,
    receivePaymentStep,
    receivePaymentAmount,
    receivePaymentSender,
    receivePaymentChain,
    receivePaymentConfirmedAt,
    receivePaymentTxHash,
    setRequestAmount,
    setRequestNote,
    setRequestExpiryId,
    setRequestStep,
    openRequest,
    closeRequest,
    completeRequestLink,
    markRequestLinkRevoked,
    closeReceivePayment,
    resetRequestUi,
    resetReceivePaymentUi,
    openReceivePaymentReceiptFromActivity,
    openRequestReceiptFromActivity,
    openRequestShareFromActivity,
    openRequestReceiptFromReceiveLink,
  }
}

export type RequestFlow = ReturnType<typeof useRequestFlow>
