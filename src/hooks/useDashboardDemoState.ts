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

export type DepositStep = 'amount' | 'review' | 'wallet' | 'processing' | 'confirmed'
export type SendStep = 'recipient' | 'amount' | 'review' | 'wallet' | 'processing' | 'confirmed'

type BalanceRollState = {
  trigger: number
  mode: BalanceRollMode
  fromValue?: string
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
  const [balanceRoll, setBalanceRoll] = useState<BalanceRollState>({
    trigger: 0,
    mode: 'fromZero',
  })
  const pendingDepositRef = useRef(0)
  const pendingSendRef = useRef(0)

  useEffect(() => {
    if (!isMock) return
    writeDemoDashboardSession({
      wallet,
      balance: dashboardBalance,
      hasCompletedDeposit,
    })
  }, [isMock, wallet, dashboardBalance, hasCompletedDeposit])

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
    setHasCompletedDeposit(false)
    setConnectOpen(false)
    closeDeposit()
    closeSend()
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
    setDepositAmount,
    setDepositChain,
    setDepositStep,
    setSendAmount,
    setSendRecipient,
    setSendChain,
    setSendStep,
  }
}
