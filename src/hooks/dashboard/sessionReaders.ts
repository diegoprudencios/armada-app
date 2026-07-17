import type { DashboardActivityItem } from '@/constants/dashboardActivity'
import {
  readActivityPanelVisible,
  readActivityUserHidden,
  readDemoDashboardSession,
} from '@/utils/demoDashboardSession'
import { getCurrentEnvironment } from '@/utils/environment'
import type { ConnectedWallet } from '@/utils/walletMenu'
import type { DemoWallet } from '@/utils/demoDashboardSession'

export function readInitialWallet(): DemoWallet | null {
  return readDemoDashboardSession()?.wallet ?? null
}

export function readInitialConnectedWallets(): ConnectedWallet[] {
  return readDemoDashboardSession()?.connectedWallets ?? []
}

export function readInitialActiveWalletId(): string | null {
  return readDemoDashboardSession()?.activeWalletId ?? null
}

export function readInitialHasCompletedDeposit(): boolean {
  if (getCurrentEnvironment() !== 'mock') return false
  const stored = readDemoDashboardSession()?.hasCompletedDeposit ?? false
  if (stored) return true
  return readInitialRecentActivity().some((item) => item.kind === 'deposit')
}

export function readInitialEarningBalance(): number {
  if (getCurrentEnvironment() === 'mock') {
    return readDemoDashboardSession()?.earningBalance ?? 0
  }
  return 0
}

export function readInitialRecentActivity(): DashboardActivityItem[] {
  if (getCurrentEnvironment() === 'mock') {
    return readDemoDashboardSession()?.recentActivity ?? []
  }
  return []
}

export function readInitialActivityVisible(): boolean {
  if (readActivityUserHidden()) return false
  if (readInitialRecentActivity().length === 0) return false
  return readActivityPanelVisible()
}

/** Heal demo sessions where receive-link activity was saved but balance was not credited. */
export function healUncreditedReceiveLinkBalance(
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

export function readHealedInitialBalance(fallback: number): number {
  if (getCurrentEnvironment() !== 'mock') return fallback
  const stored = readDemoDashboardSession()?.balance ?? fallback
  return healUncreditedReceiveLinkBalance(readInitialRecentActivity(), stored)
}
