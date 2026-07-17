import { useEffect, useRef, useState } from 'react'
import {
  activityRevealDelayAfterIntroMs,
  activityRevealDelayAfterRollMs,
} from '@/components/BalanceCard/balanceRevealMotion'
import type { DashboardActivityItem } from '@/constants/dashboardActivity'
import {
  addReceiveLinkPaymentToActivities,
  createDemoTxHash,
  prependActivity,
  updateRequestLinkActivityByRequestId,
} from '@/utils/dashboardActivity'
import {
  readActivityUserHidden,
  writeActivityPanelVisible,
  writeActivityUserHidden,
} from '@/utils/demoDashboardSession'
import { isPaymentLinkRevoked } from '@/utils/payViaLink'
import { DEMO_REQUEST_LINK_PAYMENT_DELAY_MS } from '@/pages/requestFlowConstants'
import { readInitialActivityVisible, readInitialRecentActivity } from './sessionReaders'

export interface BalanceCreditApi {
  creditBalanceIncrease: (amount: number) => void
  ensureBalanceAtLeast: (amount: number) => void
}

export function useDashboardActivity(isMock: boolean, balanceCredit: BalanceCreditApi) {
  const [activityVisible, setActivityVisible] = useState(readInitialActivityVisible)
  const [recentActivity, setRecentActivity] = useState<DashboardActivityItem[]>(readInitialRecentActivity)
  const recentActivityRef = useRef(recentActivity)
  recentActivityRef.current = recentActivity

  const activityReceiptRef = useRef(false)
  const activityRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const linkPaymentTimerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  function clearLinkPaymentTimer(requestId: string) {
    const timer = linkPaymentTimerRef.current.get(requestId)
    if (!timer) return

    clearTimeout(timer)
    linkPaymentTimerRef.current.delete(requestId)
  }

  function clearAllLinkPaymentTimers() {
    linkPaymentTimerRef.current.forEach((timer) => clearTimeout(timer))
    linkPaymentTimerRef.current.clear()
  }

  function clearActivityRevealTimer() {
    if (activityRevealTimerRef.current) {
      clearTimeout(activityRevealTimerRef.current)
      activityRevealTimerRef.current = null
    }
  }

  function scheduleActivityReveal(delayMs: number) {
    if (readActivityUserHidden()) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const resolvedDelay = prefersReducedMotion ? 80 : delayMs

    clearActivityRevealTimer()
    activityRevealTimerRef.current = setTimeout(() => {
      setActivityVisible(true)
      writeActivityPanelVisible(true)
      writeActivityUserHidden(false)
      activityRevealTimerRef.current = null
    }, resolvedDelay)
  }

  function activityRevealDelayMs() {
    return activityRevealDelayAfterIntroMs()
  }

  function prependRecentActivity(item: DashboardActivityItem) {
    setRecentActivity((items) => prependActivity(items, item))
  }

  function tryApplyReceiveLinkPayment(
    requestId: string,
    paidAmount: number,
    note?: string,
  ): number {
    if (isPaymentLinkRevoked(requestId)) return 0

    const result = addReceiveLinkPaymentToActivities(
      recentActivityRef.current,
      requestId,
      paidAmount,
      note,
      Date.now(),
      createDemoTxHash(),
    )
    if (!result) return 0

    recentActivityRef.current = result.items
    setRecentActivity(result.items)
    balanceCredit.creditBalanceIncrease(result.paidAmount)
    return result.paidAmount
  }

  function ensureReceiveLinkBalanceCredited(requestId: string) {
    const receive = recentActivityRef.current.find(
      (item): item is Extract<DashboardActivityItem, { kind: 'receiveLink' }> =>
        item.kind === 'receiveLink' && item.requestId === requestId,
    )
    if (!receive) return

    balanceCredit.ensureBalanceAtLeast(receive.paidAmount)
  }

  function settleReceiveLinkPayment(requestId: string, paidAmount: number, note?: string) {
    clearLinkPaymentTimer(requestId)
    const credited = tryApplyReceiveLinkPayment(requestId, paidAmount, note)
    if (credited <= 0) {
      ensureReceiveLinkBalanceCredited(requestId)
    }
  }

  function creditRequestLinkPayment(requestId: string, paidAmount: number, note?: string): boolean {
    return tryApplyReceiveLinkPayment(requestId, paidAmount, note) > 0
  }

  function scheduleRequestLinkPaymentDemo(payload: {
    requestId: string
    paidAmount: number
    note?: string
  }) {
    if (!isMock) return

    clearLinkPaymentTimer(payload.requestId)

    const timer = setTimeout(() => {
      linkPaymentTimerRef.current.delete(payload.requestId)
      creditRequestLinkPayment(payload.requestId, payload.paidAmount, payload.note)
    }, DEMO_REQUEST_LINK_PAYMENT_DELAY_MS)

    linkPaymentTimerRef.current.set(payload.requestId, timer)
  }

  function markRequestLinkRevoked(requestId: string) {
    if (!requestId) return

    clearLinkPaymentTimer(requestId)

    setRecentActivity((items) =>
      updateRequestLinkActivityByRequestId(items, requestId, {
        status: 'revoked',
        label: 'Payment link revoked',
      }),
    )
  }

  useEffect(() => {
    if (readActivityUserHidden()) return
    if (readInitialRecentActivity().length > 0) {
      scheduleActivityReveal(activityRevealDelayMs())
      return clearActivityRevealTimer
    }
    // Reveal once on mount when the session already has activity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => {
    clearActivityRevealTimer()
    clearAllLinkPaymentTimers()
  }, [])

  function toggleActivity() {
    setActivityVisible((visible) => {
      const next = !visible
      writeActivityPanelVisible(next)
      writeActivityUserHidden(!next)
      return next
    })
  }

  function resetActivity() {
    setActivityVisible(false)
    writeActivityPanelVisible(false)
    writeActivityUserHidden(false)
    setRecentActivity([])
  }

  return {
    activityVisible,
    recentActivity,
    recentActivityRef,
    activityReceiptRef,
    setRecentActivity,
    prependRecentActivity,
    scheduleActivityReveal,
    activityRevealDelayMs,
    activityRevealDelayAfterRollMs,
    clearAllLinkPaymentTimers,
    clearLinkPaymentTimer,
    toggleActivity,
    resetActivity,
    settleReceiveLinkPayment,
    scheduleRequestLinkPaymentDemo,
    markRequestLinkRevoked,
  }
}

export type DashboardActivityState = ReturnType<typeof useDashboardActivity>
