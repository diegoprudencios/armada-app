import { useEffect, useRef, useState } from 'react'
import type { DepositChainId } from '@/components/DepositAmountCard'
import type { BalanceRollMode } from '@/components/RollingBalanceValue'
import { useEnvironment } from '@/hooks/useEnvironment'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import {
  readDemoDashboardSession,
  writeDemoDashboardSession,
  type DemoWallet,
} from '@/utils/demoDashboardSession'
import { getCurrentEnvironment } from '@/utils/environment'
import { returnToLanding } from '@/utils/appNavigation'
import {
  resolveDemoWalletAddress,
  type DemoWalletProvider,
} from '@/pages/depositFlowConstants'
import type { SendChainId } from '@/pages/sendFlowConstants'
import type { EarnModalStep, EarnTab } from '@/pages/earnFlowConstants'

export type DepositStep = 'amount' | 'review' | 'wallet' | 'processing' | 'confirmed'
export type SendStep = 'recipient' | 'amount' | 'review' | 'wallet' | 'processing' | 'confirmed'
export type EarnStep = EarnModalStep

type BalanceRollState = {
  trigger: number
  mode: BalanceRollMode
  fromValue?: string
  vaultFromValue?: string
}

function readInitialWallet(): DemoWallet | null {
  return readDemoDashboardSession()?.wallet ?? null
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

export function useDashboardDemoState(initialBalance = 0) {
  const [environment] = useEnvironment()
  const isMock = environment === 'mock'

  const [wallet, setWallet] = useState<DemoWallet | null>(readInitialWallet)
  const [dashboardBalance, setDashboardBalance] = useState(() => readInitialBalance(initialBalance))
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
  const [earningBalance, setEarningBalance] = useState(readInitialEarningBalance)
  const [balanceRoll, setBalanceRoll] = useState<BalanceRollState>({
    trigger: 0,
    mode: 'fromZero',
  })
  const pendingDepositRef = useRef(0)
  const pendingSendRef = useRef(0)
  const pendingEarnRef = useRef<{ amount: number; tab: EarnTab } | null>(null)

  useEffect(() => {
    if (!isMock) return
    writeDemoDashboardSession({
      wallet,
      balance: dashboardBalance,
      earningBalance,
      hasCompletedDeposit,
    })
  }, [isMock, wallet, dashboardBalance, earningBalance, hasCompletedDeposit])

  function openConnect() {
    setConnectOpen(true)
  }

  function connectWallet(provider: DemoWalletProvider) {
    const address = resolveDemoWalletAddress(provider)
    if (!address) return

    setWallet({ address, provider })
    setConnectOpen(false)
  }

  function disconnectWallet() {
    setWallet(null)
    setDashboardBalance(initialBalance)
    setEarningBalance(0)
    setHasCompletedDeposit(false)
    setConnectOpen(false)
    closeDeposit()
    closeSend()
    closeEarn()
    returnToLanding()
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
    setSendStep(null)
    setSendAmount('')
    setSendRecipient('')
    setSendChain('ethereum')

    const sent = pendingSendRef.current
    pendingSendRef.current = 0

    if (sent > 0) {
      const fromValue = formatUsdcAmount(dashboardBalance)
      setDashboardBalance((prev) => prev - sent)
      setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue,
      }))
    }
  }

  function completeSend() {
    const sent = parseActiveAmount(sendAmount)
    if (sent > 0) {
      pendingSendRef.current = sent
    }
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

  function closeDeposit() {
    setDepositStep(null)
    setDepositAmount('')
    setDepositChain('sepolia')

    const deposited = pendingDepositRef.current
    pendingDepositRef.current = 0

    if (deposited > 0) {
      const fromValue = formatUsdcAmount(dashboardBalance)
      setDashboardBalance((prev) => prev + deposited)
      setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue,
      }))
    }
  }

  function completeDeposit() {
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
    setEarnStep(null)
    setEarnAmount('')
    setEarnTab('add')

    const pending = pendingEarnRef.current
    pendingEarnRef.current = null

    if (!pending || pending.amount <= 0) return

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
  }

  function completeEarn() {
    const moved = parseActiveAmount(earnAmount)
    if (moved > 0) {
      pendingEarnRef.current = { amount: moved, tab: earnTab }
    }
  }

  const earnSourceBalance = earnTab === 'add' ? dashboardBalance : earningBalance
  const showDepositTooltip = Boolean(wallet) && !hasCompletedDeposit

  return {
    wallet,
    dashboardBalance,
    hasCompletedDeposit,
    connectOpen,
    depositStep,
    depositAmount,
    depositChain,
    sendStep,
    sendAmount,
    sendRecipient,
    sendChain,
    earnStep,
    earnTab,
    earnAmount,
    earningBalance,
    earnSourceBalance,
    balanceRoll,
    showDepositTooltip,
    openConnect,
    connectWallet,
    disconnectWallet,
    openDeposit,
    closeDeposit,
    completeDeposit,
    openSend,
    closeSend,
    completeSend,
    openEarn,
    closeEarn,
    completeEarn,
    setDepositAmount,
    setDepositChain,
    setDepositStep,
    setSendAmount,
    setSendRecipient,
    setSendChain,
    setSendStep,
    setEarnTab,
    setEarnAmount,
    setEarnStep,
  }
}
