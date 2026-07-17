import { useRef, useState } from 'react'
import type { DepositChainId } from '@/constants/depositChains'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import { createDepositActivity } from '@/utils/dashboardActivity'
import type { DemoWalletSession } from './useDemoWalletSession'
import type { DemoBalances } from './useDemoBalances'
import type { DashboardActivityState } from './useDashboardActivity'
import type { DepositStep } from './types'

export interface UseDepositFlowOptions {
  walletSession: DemoWalletSession
  balances: DemoBalances
  activity: DashboardActivityState
}

export function useDepositFlow({ walletSession, balances, activity }: UseDepositFlowOptions) {
  const [depositStep, setDepositStep] = useState<DepositStep | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositChain, setDepositChain] = useState<DepositChainId>('sepolia')
  const [depositConfirmedAt, setDepositConfirmedAt] = useState<number | null>(null)
  const pendingDepositRef = useRef(0)

  function resetDepositUi() {
    setDepositStep(null)
    setDepositAmount('')
    setDepositChain('sepolia')
    setDepositConfirmedAt(null)
    pendingDepositRef.current = 0
  }

  function openDeposit() {
    if (!walletSession.requireWallet()) return
    setDepositAmount('')
    setDepositChain('sepolia')
    setDepositStep('amount')
  }

  function openDepositFromWallet(walletId: string, chain: DepositChainId) {
    if (!walletSession.activateWallet(walletId)) return
    setDepositAmount('')
    setDepositChain(chain)
    setDepositStep('amount')
  }

  function closeDeposit() {
    if (activity.activityReceiptRef.current) {
      activity.activityReceiptRef.current = false
      resetDepositUi()
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
      activity.prependRecentActivity(createDepositActivity(deposited, chain))
      const fromValue = formatUsdcAmount(balances.dashboardBalance)
      const nextBalance = balances.dashboardBalance + deposited
      balances.setDashboardBalance(nextBalance)
      balances.setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue,
      }))
      activity.scheduleActivityReveal(
        activity.activityRevealDelayAfterRollMs(formatUsdcAmount(nextBalance)),
      )
    }
  }

  function completeDeposit() {
    if (activity.activityReceiptRef.current) return

    const deposited = parseActiveAmount(depositAmount)
    if (deposited > 0) {
      pendingDepositRef.current = deposited
    }
    balances.setHasCompletedDeposit(true)
  }

  function openDepositConfirmedFromActivity(
    chain: DepositChainId,
    amountLabel: string,
    confirmedAt: number,
  ) {
    setDepositChain(chain)
    setDepositAmount(amountLabel)
    setDepositConfirmedAt(confirmedAt)
    setDepositStep('confirmed')
  }

  return {
    depositStep,
    depositAmount,
    depositChain,
    depositConfirmedAt,
    setDepositStep,
    setDepositAmount,
    setDepositChain,
    setDepositConfirmedAt,
    openDeposit,
    openDepositFromWallet,
    closeDeposit,
    completeDeposit,
    resetDepositUi,
    openDepositConfirmedFromActivity,
  }
}

export type DepositFlow = ReturnType<typeof useDepositFlow>
