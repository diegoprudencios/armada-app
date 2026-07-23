import { useState } from 'react'
import { activityRevealDelayAfterRollMs } from '@/components/BalanceCard/balanceRevealMotion'
import { readActivityUserHidden } from '@/utils/demoDashboardSession'
import { formatUsdcAmount } from '@/utils/format'
import type { BalanceRollState } from './types'
import {
  readHealedInitialBalance,
  readInitialEarningBalance,
  readInitialHasCompletedDeposit,
} from './sessionReaders'

export interface UseDemoBalancesOptions {
  initialBalance: number
  scheduleActivityReveal: (delayMs: number) => void
}

export function useDemoBalances({ initialBalance, scheduleActivityReveal }: UseDemoBalancesOptions) {
  const [dashboardBalance, setDashboardBalance] = useState(() => readHealedInitialBalance(initialBalance))
  const [earningBalance, setEarningBalance] = useState(readInitialEarningBalance)
  const [hasCompletedDeposit, setHasCompletedDeposit] = useState(readInitialHasCompletedDeposit)
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [balanceRoll, setBalanceRoll] = useState<BalanceRollState>({
    trigger: 0,
    mode: 'fromZero',
  })

  function resetBalances(nextInitialBalance: number) {
    setDashboardBalance(nextInitialBalance)
    setEarningBalance(0)
    setHasCompletedDeposit(false)
    setBalanceHidden(false)
    setBalanceRoll({ trigger: 0, mode: 'fromZero' })
  }

  function creditBalanceIncrease(amount: number) {
    if (amount <= 0) return

    setHasCompletedDeposit(true)
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

  function ensureBalanceAtLeast(amount: number) {
    setDashboardBalance((prev) => {
      if (prev >= amount) return prev

      setHasCompletedDeposit(true)
      const next = amount
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

  return {
    dashboardBalance,
    earningBalance,
    hasCompletedDeposit,
    balanceHidden,
    balanceRoll,
    setDashboardBalance,
    setEarningBalance,
    setHasCompletedDeposit,
    setBalanceHidden,
    setBalanceRoll,
    resetBalances,
    creditBalanceIncrease,
    ensureBalanceAtLeast,
  }
}

export type DemoBalances = ReturnType<typeof useDemoBalances>
