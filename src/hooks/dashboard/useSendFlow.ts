import { useEffect, useRef, useState } from 'react'
import type { SendChainId } from '@/pages/sendFlowConstants'
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

export function useSendFlow({ walletSession, balances, activity }: UseSendFlowOptions) {
  const [sendStep, setSendStep] = useState<SendStep | null>(null)
  const [sendAmount, setSendAmount] = useState('')
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendChain, setSendChain] = useState<SendChainId>('ethereum')
  const [sendConfirmedAt, setSendConfirmedAt] = useState<number | null>(null)
  const pendingSendRef = useRef(0)
  const pendingPayViaLinkRef = useRef<PendingPayViaLink | null>(null)

  useEffect(() => {
    const pendingPay = readPendingPayViaLink()
    if (!pendingPay || !walletSession.wallet) return

    pendingPayViaLinkRef.current = pendingPay
    setSendRecipient(pendingPay.recipient)
    setSendAmount(pendingPay.amount ?? '')
    setSendChain('ethereum')
    setSendStep(pendingPay.amount ? 'review' : 'amount')
    clearPendingPayViaLink()
  }, [walletSession.wallet])

  function resetSendUi() {
    setSendStep(null)
    setSendAmount('')
    setSendRecipient('')
    setSendChain('ethereum')
    setSendConfirmedAt(null)
    pendingSendRef.current = 0
    pendingPayViaLinkRef.current = null
  }

  function openSend() {
    if (!walletSession.requireWallet()) return
    setSendRecipient('')
    setSendAmount('')
    setSendChain('ethereum')
    setSendStep('recipient')
  }

  function closeSend() {
    if (activity.activityReceiptRef.current) {
      activity.activityReceiptRef.current = false
      resetSendUi()
      return
    }

    const sent = pendingSendRef.current
    const recipient = sendRecipient
    const chain = sendChain
    pendingSendRef.current = 0
    setSendStep(null)
    setSendAmount('')
    setSendRecipient('')
    setSendChain('ethereum')
    setSendConfirmedAt(null)

    if (sent > 0) {
      const pendingPay = pendingPayViaLinkRef.current

      if (pendingPay) {
        activity.settleReceiveLinkPayment(pendingPay.requestId, sent, pendingPay.note)
        pendingPayViaLinkRef.current = null
      } else {
        activity.prependRecentActivity(createSendActivity(sent, recipient, chain))

        balances.setDashboardBalance((prev) => {
          balances.setBalanceRoll((roll) => ({
            trigger: roll.trigger + 1,
            mode: 'fromValue',
            fromValue: formatUsdcAmount(prev),
          }))
          return prev - sent
        })
        if (!readActivityUserHidden()) {
          activity.scheduleActivityReveal(activity.activityRevealDelayMs())
        }
      }
    }
  }

  function completeSend() {
    if (activity.activityReceiptRef.current) return

    const sent = parseActiveAmount(sendAmount)
    if (sent <= 0) return

    const pendingPay = pendingPayViaLinkRef.current
    if (pendingPay) {
      activity.settleReceiveLinkPayment(pendingPay.requestId, sent, pendingPay.note)
      pendingPayViaLinkRef.current = null
      pendingSendRef.current = 0
      return
    }

    pendingSendRef.current = sent
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
    setSendStep('confirmed')
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
