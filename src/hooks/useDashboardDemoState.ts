import { useEffect, useRef, useState } from 'react'
import type { DepositChainId } from '@/components/DepositAmountCard'
import type { BalanceRollMode } from '@/components/RollingBalanceValue'
import {
  activityRevealDelayAfterIntroMs,
  activityRevealDelayAfterRollMs,
} from '@/components/BalanceCard/balanceRevealMotion'
import { useEnvironment } from '@/hooks/useEnvironment'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import {
  readActivityUserHidden,
  readActivityPanelVisible,
  readDemoDashboardSession,
  writeActivityPanelVisible,
  writeActivityUserHidden,
  writeDemoDashboardSession,
  type DemoWallet,
} from '@/utils/demoDashboardSession'
import { getCurrentEnvironment } from '@/utils/environment'
import { returnToLanding } from '@/utils/appNavigation'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import {
  createConnectedWallet,
  demoWalletFromConnected,
  type ConnectedWallet,
} from '@/utils/walletMenu'
import type { SendChainId } from '@/pages/sendFlowConstants'
import type { EarnModalStep, EarnTab } from '@/pages/earnFlowConstants'
import type { WithdrawModalStep } from '@/pages/withdrawFlowConstants'
import type { RequestModalStep } from '@/pages/requestFlowConstants'
import {
  DEFAULT_REQUEST_LINK_EXPIRY_ID,
  DEMO_REQUEST_LINK_PAYMENT_DELAY_MS,
  type RequestLinkExpiryId,
} from '@/pages/requestFlowConstants'
import type { DashboardActivityItem } from '@/constants/dashboardActivity'
import {
  addReceiveLinkPaymentToActivities,
  createDepositActivity,
  createEarnActivity,
  createRequestLinkActivity,
  createSendActivity,
  createWithdrawActivity,
  createDemoTxHash,
  findRequestLinkActivity,
  prependActivity,
  resolveActivityTxHash,
  updateRequestLinkActivityByRequestId,
} from '@/utils/dashboardActivity'
import { clearPendingPayViaLink, isPaymentLinkRevoked, readPendingPayViaLink, type PendingPayViaLink } from '@/utils/payViaLink'

export type DepositStep = 'amount' | 'review' | 'wallet' | 'processing' | 'confirmed'
export type SendStep = 'recipient' | 'amount' | 'review' | 'processing' | 'confirmed'
export type EarnStep = EarnModalStep
export type WithdrawStep = WithdrawModalStep
export type RequestStep = RequestModalStep
export type ReceivePaymentStep = 'confirmed'

type BalanceRollState = {
  trigger: number
  mode: BalanceRollMode
  fromValue?: string
  vaultFromValue?: string
}

function readInitialWallet(): DemoWallet | null {
  return readDemoDashboardSession()?.wallet ?? null
}

function readInitialConnectedWallets(): ConnectedWallet[] {
  return readDemoDashboardSession()?.connectedWallets ?? []
}

function readInitialActiveWalletId(): string | null {
  return readDemoDashboardSession()?.activeWalletId ?? null
}

function readInitialBalance(fallback: number): number {
  if (getCurrentEnvironment() === 'mock') {
    return readDemoDashboardSession()?.balance ?? fallback
  }
  return fallback
}

function readInitialHasCompletedDeposit(): boolean {
  if (getCurrentEnvironment() === 'mock') {
    return readDemoDashboardSession()?.hasCompletedDeposit ?? false
  }
  return false
}

function readInitialEarningBalance(): number {
  if (getCurrentEnvironment() === 'mock') {
    return readDemoDashboardSession()?.earningBalance ?? 0
  }
  return 0
}

function readInitialRecentActivity(): DashboardActivityItem[] {
  if (getCurrentEnvironment() === 'mock') {
    return readDemoDashboardSession()?.recentActivity ?? []
  }
  return []
}

function readInitialActivityVisible(): boolean {
  if (readActivityUserHidden()) return false
  if (readInitialRecentActivity().length === 0) return false
  return readActivityPanelVisible()
}

/** Heal demo sessions where receive-link activity was saved but balance was not credited. */
function healUncreditedReceiveLinkBalance(
  items: readonly DashboardActivityItem[],
  balance: number,
): number {
  if (balance > 0) return balance
  if (!items.some((item) => item.kind === 'receiveLink')) return balance
  if (items.some((item) => item.kind === 'deposit' || item.kind === 'send' || item.kind === 'withdraw')) {
    return balance
  }

  return items
    .filter((item): item is Extract<DashboardActivityItem, { kind: 'receiveLink' }> => item.kind === 'receiveLink')
    .reduce((sum, item) => sum + item.paidAmount, 0)
}

function readHealedInitialBalance(fallback: number): number {
  if (getCurrentEnvironment() !== 'mock') return fallback
  const stored = readDemoDashboardSession()?.balance ?? fallback
  return healUncreditedReceiveLinkBalance(readInitialRecentActivity(), stored)
}

export function useDashboardDemoState(initialBalance = 0) {
  const [environment] = useEnvironment()
  const isMock = environment === 'mock'

  const [wallet, setWallet] = useState<DemoWallet | null>(readInitialWallet)
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>(readInitialConnectedWallets)
  const [activeWalletId, setActiveWalletId] = useState<string | null>(readInitialActiveWalletId)
  const [dashboardBalance, setDashboardBalance] = useState(() => readHealedInitialBalance(initialBalance))
  const [hasCompletedDeposit, setHasCompletedDeposit] = useState(readInitialHasCompletedDeposit)
  const [connectOpen, setConnectOpen] = useState(false)
  const [depositStep, setDepositStep] = useState<DepositStep | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositChain, setDepositChain] = useState<DepositChainId>('sepolia')
  const [sendStep, setSendStep] = useState<SendStep | null>(null)
  const [sendAmount, setSendAmount] = useState('')
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendChain, setSendChain] = useState<SendChainId>('ethereum')
  const [earnStep, setEarnStep] = useState<EarnStep | null>(null)
  const [earnTab, setEarnTab] = useState<EarnTab>('add')
  const [earnAmount, setEarnAmount] = useState('')
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep | null>(null)
  const [withdrawRecipient, setWithdrawRecipient] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawChain, setWithdrawChain] = useState<SendChainId>('ethereum')
  const [earningBalance, setEarningBalance] = useState(readInitialEarningBalance)
  const [activityVisible, setActivityVisible] = useState(readInitialActivityVisible)
  const [recentActivity, setRecentActivity] = useState<DashboardActivityItem[]>(readInitialRecentActivity)
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [depositConfirmedAt, setDepositConfirmedAt] = useState<number | null>(null)
  const [sendConfirmedAt, setSendConfirmedAt] = useState<number | null>(null)
  const [earnConfirmedAt, setEarnConfirmedAt] = useState<number | null>(null)
  const [withdrawConfirmedAt, setWithdrawConfirmedAt] = useState<number | null>(null)
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
  const [balanceRoll, setBalanceRoll] = useState<BalanceRollState>({
    trigger: 0,
    mode: 'fromZero',
  })
  const pendingDepositRef = useRef(0)
  const pendingSendRef = useRef(0)
  const pendingEarnRef = useRef<{ amount: number; tab: EarnTab } | null>(null)
  const pendingWithdrawRef = useRef(0)
  const pendingPayViaLinkRef = useRef<PendingPayViaLink | null>(null)
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

  function creditBalanceIncrease(amount: number) {
    if (amount <= 0) return

    setDashboardBalance((prev) => {
      const next = prev + amount
      setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue: formatUsdcAmount(prev),
      }))
      if (!readActivityUserHidden()) {
        scheduleActivityReveal(activityRevealDelayAfterRollMs(formatUsdcAmount(next)))
      }
      return next
    })
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
    creditBalanceIncrease(result.paidAmount)
    return result.paidAmount
  }

  function ensureReceiveLinkBalanceCredited(requestId: string) {
    const receive = recentActivityRef.current.find(
      (item): item is Extract<DashboardActivityItem, { kind: 'receiveLink' }> =>
        item.kind === 'receiveLink' && item.requestId === requestId,
    )
    if (!receive) return

    setDashboardBalance((prev) => {
      if (prev >= receive.paidAmount) return prev

      const next = receive.paidAmount
      setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue: formatUsdcAmount(prev),
      }))
      if (!readActivityUserHidden()) {
        scheduleActivityReveal(activityRevealDelayAfterRollMs(formatUsdcAmount(next)))
      }
      return next
    })
  }

  function settleReceiveLinkPayment(
    requestId: string,
    paidAmount: number,
    note?: string,
  ) {
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

  function activityRevealDelayMs(): number {
    return activityRevealDelayAfterIntroMs()
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

  useEffect(() => {
    const pendingPay = readPendingPayViaLink()
    if (!pendingPay || !wallet) return

    pendingPayViaLinkRef.current = pendingPay
    setSendRecipient(pendingPay.recipient)
    setSendAmount(pendingPay.amount ?? '')
    setSendChain('ethereum')
    setSendStep(pendingPay.amount ? 'review' : 'amount')
    clearPendingPayViaLink()
  }, [wallet])

  useEffect(() => {
    if (!isMock) return
    writeDemoDashboardSession({
      wallet,
      connectedWallets,
      activeWalletId,
      balance: dashboardBalance,
      earningBalance,
      hasCompletedDeposit,
      recentActivity,
    })
  }, [
    isMock,
    wallet,
    connectedWallets,
    activeWalletId,
    dashboardBalance,
    earningBalance,
    hasCompletedDeposit,
    recentActivity,
  ])

  function openConnect() {
    setConnectOpen(true)
  }

  function connectWallet(provider: DemoWalletProvider) {
    const nextWallet = createConnectedWallet(provider)
    if (!nextWallet) return

    const existing = connectedWallets.find((entry) => entry.id === nextWallet.id)
    if (existing) {
      setActiveWalletId(existing.id)
      setWallet(demoWalletFromConnected(existing))
      setConnectOpen(false)
      return
    }

    setConnectedWallets([...connectedWallets, nextWallet])
    setActiveWalletId(nextWallet.id)
    setWallet(demoWalletFromConnected(nextWallet))
    setConnectOpen(false)
  }

  function selectActiveWallet(walletId: string) {
    const selected = connectedWallets.find((entry) => entry.id === walletId)
    if (!selected) return

    setActiveWalletId(walletId)
    setWallet(demoWalletFromConnected(selected))
  }

  function resetDashboardSession() {
    clearAllLinkPaymentTimers()
    setWallet(null)
    setConnectedWallets([])
    setActiveWalletId(null)
    setDashboardBalance(initialBalance)
    setEarningBalance(0)
    setHasCompletedDeposit(false)
    setActivityVisible(false)
    writeActivityPanelVisible(false)
    writeActivityUserHidden(false)
    setBalanceHidden(false)
    setRecentActivity([])
    setConnectOpen(false)
    closeDeposit()
    closeSend()
    closeEarn()
    closeWithdraw()
    closeRequest()
    returnToLanding()
  }

  function disconnectWallet(walletId?: string) {
    const targetId = walletId ?? activeWalletId
    if (!targetId) {
      resetDashboardSession()
      return
    }

    const next = connectedWallets.filter((entry) => entry.id !== targetId)
    if (next.length === 0) {
      resetDashboardSession()
      return
    }

    const nextActive =
      targetId === activeWalletId
        ? next[0]
        : next.find((entry) => entry.id === activeWalletId) ?? next[0]

    setConnectedWallets(next)
    setActiveWalletId(nextActive.id)
    setWallet(demoWalletFromConnected(nextActive))
  }

  function openSend() {
    if (!wallet) {
      openConnect()
      return
    }
    setSendRecipient('')
    setSendAmount('')
    setSendChain('ethereum')
    setSendStep('recipient')
  }

  function closeSend() {
    if (activityReceiptRef.current) {
      activityReceiptRef.current = false
      setSendStep(null)
      setSendAmount('')
      setSendRecipient('')
      setSendChain('ethereum')
      setSendConfirmedAt(null)
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
        settleReceiveLinkPayment(pendingPay.requestId, sent, pendingPay.note)
        pendingPayViaLinkRef.current = null
      } else {
        setRecentActivity((items) => prependActivity(items, createSendActivity(sent, recipient, chain)))

        setDashboardBalance((prev) => {
          setBalanceRoll((roll) => ({
            trigger: roll.trigger + 1,
            mode: 'fromValue',
            fromValue: formatUsdcAmount(prev),
          }))
          return prev - sent
        })
        if (!readActivityUserHidden()) {
          scheduleActivityReveal(activityRevealDelayMs())
        }
      }
    }
  }

  function completeSend() {
    if (activityReceiptRef.current) return

    const sent = parseActiveAmount(sendAmount)
    if (sent <= 0) return

    const pendingPay = pendingPayViaLinkRef.current
    if (pendingPay) {
      settleReceiveLinkPayment(pendingPay.requestId, sent, pendingPay.note)
      pendingPayViaLinkRef.current = null
      pendingSendRef.current = 0
      return
    }

    pendingSendRef.current = sent
  }

  function openDeposit() {
    if (!wallet) {
      openConnect()
      return
    }
    setDepositAmount('')
    setDepositChain('sepolia')
    setDepositStep('amount')
  }

  function openDepositFromWallet(walletId: string, chain: DepositChainId) {
    const selected = connectedWallets.find((entry) => entry.id === walletId)
    if (!selected) return

    setActiveWalletId(walletId)
    setWallet(demoWalletFromConnected(selected))
    setDepositAmount('')
    setDepositChain(chain)
    setDepositStep('amount')
  }

  function closeDeposit() {
    if (activityReceiptRef.current) {
      activityReceiptRef.current = false
      setDepositStep(null)
      setDepositAmount('')
      setDepositChain('sepolia')
      setDepositConfirmedAt(null)
      return
    }

    const deposited = pendingDepositRef.current
    const chain = depositChain
    pendingDepositRef.current = 0
    setDepositStep(null)
    setDepositAmount('')
    setDepositChain('sepolia')
    setDepositConfirmedAt(null)

    if (deposited > 0) {
      setRecentActivity((items) => prependActivity(items, createDepositActivity(deposited, chain)))
      const fromValue = formatUsdcAmount(dashboardBalance)
      const nextBalance = dashboardBalance + deposited
      setDashboardBalance(nextBalance)
      setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue,
      }))
      scheduleActivityReveal(activityRevealDelayAfterRollMs(formatUsdcAmount(nextBalance)))
    }
  }

  function completeDeposit() {
    if (activityReceiptRef.current) return

    const deposited = parseActiveAmount(depositAmount)
    if (deposited > 0) {
      pendingDepositRef.current = deposited
    }
    setHasCompletedDeposit(true)
  }

  function openEarn(tab: EarnTab = 'add') {
    if (!wallet) {
      openConnect()
      return
    }
    setEarnTab(tab)
    setEarnAmount('')
    setEarnStep('amount')
  }

  function closeEarn() {
    if (activityReceiptRef.current) {
      activityReceiptRef.current = false
      setEarnStep(null)
      setEarnAmount('')
      setEarnTab('add')
      setEarnConfirmedAt(null)
      return
    }

    setEarnStep(null)
    setEarnAmount('')
    setEarnTab('add')
    setEarnConfirmedAt(null)

    const pending = pendingEarnRef.current
    pendingEarnRef.current = null

    if (!pending || pending.amount <= 0) return

    setRecentActivity((items) =>
      prependActivity(items, createEarnActivity(pending.amount, pending.tab)),
    )

    if (pending.tab === 'add') {
      const balanceFrom = formatUsdcAmount(dashboardBalance)
      const vaultFrom = formatUsdcAmount(earningBalance)
      setDashboardBalance((prev) => prev - pending.amount)
      setEarningBalance((prev) => prev + pending.amount)
      setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue: balanceFrom,
        vaultFromValue: vaultFrom,
      }))
      if (!readActivityUserHidden()) {
        scheduleActivityReveal(activityRevealDelayMs())
      }
      return
    }

    const balanceFrom = formatUsdcAmount(dashboardBalance)
    const vaultFrom = formatUsdcAmount(earningBalance)
    setEarningBalance((prev) => prev - pending.amount)
    setDashboardBalance((prev) => prev + pending.amount)
    setBalanceRoll((roll) => ({
      trigger: roll.trigger + 1,
      mode: 'fromValue',
      fromValue: balanceFrom,
      vaultFromValue: vaultFrom,
    }))
    if (!readActivityUserHidden()) {
      scheduleActivityReveal(activityRevealDelayMs())
    }
  }

  function completeEarn() {
    if (activityReceiptRef.current) return

    const moved = parseActiveAmount(earnAmount)
    if (moved > 0) {
      pendingEarnRef.current = { amount: moved, tab: earnTab }
    }
  }

  function openWithdraw() {
    if (!wallet) {
      openConnect()
      return
    }
    if (dashboardBalance <= 0) return
    setWithdrawRecipient(wallet.address)
    setWithdrawAmount('')
    setWithdrawChain('ethereum')
    setWithdrawStep('recipient')
  }

  function closeWithdraw() {
    if (activityReceiptRef.current) {
      activityReceiptRef.current = false
      setWithdrawStep(null)
      setWithdrawRecipient('')
      setWithdrawAmount('')
      setWithdrawChain('ethereum')
      setWithdrawConfirmedAt(null)
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
      setRecentActivity((items) =>
        prependActivity(items, createWithdrawActivity(withdrawn, chain, recipient)),
      )
      const fromValue = formatUsdcAmount(dashboardBalance)
      setDashboardBalance((prev) => prev - withdrawn)
      setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue,
      }))
      if (!readActivityUserHidden()) {
        scheduleActivityReveal(activityRevealDelayMs())
      }
    }
  }

  function completeWithdraw() {
    if (activityReceiptRef.current) return

    const withdrawn = parseActiveAmount(withdrawAmount)
    if (withdrawn > 0) {
      pendingWithdrawRef.current = withdrawn
    }
  }

  function openRequest() {
    if (!wallet) {
      openConnect()
      return
    }
    setRequestAmount('')
    setRequestNote('')
    setRequestExpiryId(DEFAULT_REQUEST_LINK_EXPIRY_ID)
    setRequestPaymentLink('')
    setRequestId('')
    setRequestExpiresAt(0)
    setRequestLinkRevoked(false)
    setRequestStep('receive')
  }

  function closeRequest() {
    if (activityReceiptRef.current) {
      activityReceiptRef.current = false
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
      return
    }

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
    setRecentActivity((items) =>
      prependActivity(
        items,
        createRequestLinkActivity({
          requestId: payload.requestId,
          paymentLink: payload.paymentLink,
          expiresAt: payload.expiresAt,
          requestedAmount,
          note: trimmedNote || undefined,
        }),
      ),
    )

    scheduleRequestLinkPaymentDemo({
      requestId: payload.requestId,
      paidAmount: requestedAmount,
      note: trimmedNote || undefined,
    })

    if (!readActivityUserHidden()) {
      scheduleActivityReveal(activityRevealDelayMs())
    }
  }

  function markRequestLinkRevoked() {
    setRequestLinkRevoked(true)
    if (!requestId) return

    clearLinkPaymentTimer(requestId)

    setRecentActivity((items) =>
      updateRequestLinkActivityByRequestId(items, requestId, {
        status: 'revoked',
        label: 'Payment link revoked',
      }),
    )
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
    if (activityReceiptRef.current) {
      activityReceiptRef.current = false
      setReceivePaymentStep(null)
      setReceivePaymentAmount('')
      setReceivePaymentSender('')
      setReceivePaymentChain('ethereum')
      setReceivePaymentConfirmedAt(null)
      setReceivePaymentTxHash('')
      return
    }

    setReceivePaymentStep(null)
    setReceivePaymentAmount('')
    setReceivePaymentSender('')
    setReceivePaymentChain('ethereum')
    setReceivePaymentConfirmedAt(null)
    setReceivePaymentTxHash('')
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

  const earnSourceBalance = earnTab === 'add' ? dashboardBalance : earningBalance
  const showDepositTooltip = Boolean(wallet) && dashboardBalance <= 0

  function toggleActivity() {
    setActivityVisible((visible) => {
      const next = !visible
      writeActivityPanelVisible(next)
      writeActivityUserHidden(!next)
      return next
    })
  }

  function openActivityReceipt(item: DashboardActivityItem) {
    if (!wallet) return

    activityReceiptRef.current = true

    const amountLabel = String(Math.abs(item.amount))

    switch (item.kind) {
      case 'send':
        setSendRecipient(item.recipient)
        setSendChain(item.chain)
        setSendAmount(amountLabel)
        setSendConfirmedAt(item.occurredAt)
        setSendStep('confirmed')
        return
      case 'deposit':
        setDepositChain(item.chain)
        setDepositAmount(amountLabel)
        setDepositConfirmedAt(item.occurredAt)
        setDepositStep('confirmed')
        return
      case 'earn':
        setEarnTab(item.tab)
        setEarnAmount(amountLabel)
        setEarnConfirmedAt(item.occurredAt)
        setEarnStep('confirmed')
        return
      case 'withdraw':
        setWithdrawRecipient(item.recipient)
        setWithdrawChain(item.chain)
        setWithdrawAmount(amountLabel)
        setWithdrawConfirmedAt(item.occurredAt)
        setWithdrawStep('confirmed')
        return
      case 'requestLink': {
        if (item.status === 'paid') {
          openRequestReceiptFromActivity(
            item.requestId,
            item.paidAmount ?? item.requestedAmount,
            item.note,
            item.paidAt ?? item.occurredAt,
            item.txHash ?? resolveActivityTxHash(item),
          )
          return
        }
        openRequestShareFromActivity(item)
        return
      }
      case 'receiveLink': {
        const linkedRequest = findRequestLinkActivity(recentActivity, item.requestId)
        openRequestReceiptFromActivity(
          item.requestId,
          item.paidAmount,
          item.note ?? linkedRequest?.note,
          item.occurredAt,
          item.txHash,
        )
        return
      }
      case 'receive':
        openReceivePaymentReceiptFromActivity(
          item.sender,
          item.amount,
          item.chain,
          item.occurredAt,
          item.txHash,
        )
        return
      default:
        activityReceiptRef.current = false
    }
  }

  return {
    wallet,
    connectedWallets,
    activeWalletId,
    dashboardBalance,
    hasCompletedDeposit,
    connectOpen,
    depositStep,
    depositAmount,
    depositChain,
    depositConfirmedAt,
    sendStep,
    sendAmount,
    sendRecipient,
    sendChain,
    sendConfirmedAt,
    earnStep,
    earnTab,
    earnAmount,
    earnConfirmedAt,
    withdrawStep,
    withdrawRecipient,
    withdrawAmount,
    withdrawChain,
    withdrawConfirmedAt,
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
    earningBalance,
    activityVisible,
    recentActivity,
    balanceHidden,
    earnSourceBalance,
    balanceRoll,
    showDepositTooltip,
    openConnect,
    connectWallet,
    selectActiveWallet,
    disconnectWallet,
    openDeposit,
    openDepositFromWallet,
    closeDeposit,
    completeDeposit,
    openSend,
    closeSend,
    completeSend,
    openEarn,
    closeEarn,
    completeEarn,
    openWithdraw,
    closeWithdraw,
    completeWithdraw,
    openRequest,
    closeRequest,
    completeRequestLink,
    markRequestLinkRevoked,
    closeReceivePayment,
    setDepositAmount,
    setDepositChain,
    setDepositStep,
    setDepositConfirmedAt,
    setSendAmount,
    setSendRecipient,
    setSendChain,
    setSendStep,
    setSendConfirmedAt,
    setEarnTab,
    setEarnAmount,
    setEarnStep,
    setEarnConfirmedAt,
    setWithdrawRecipient,
    setWithdrawAmount,
    setWithdrawChain,
    setWithdrawStep,
    setWithdrawConfirmedAt,
    setRequestAmount,
    setRequestNote,
    setRequestExpiryId,
    setBalanceHidden,
    toggleActivity,
    openActivityReceipt,
  }
}
