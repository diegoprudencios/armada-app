import {
  clearDemoDashboardSession,
  writeActivityPanelVisible,
  writeActivityUserHidden,
  writeDemoDashboardSession,
} from '@/utils/demoDashboardSession'
import { DEMO_WALLET_ADDRESS } from '@/pages/depositFlowConstants'

export const LANDING_PATH = '/'
export const APP_DASHBOARD_V1_PATH = '/dashboard'
export const APP_DASHBOARD_V2_PATH = '/dashboard-v2'

export function openAppWithWallet(): void {
  writeDemoDashboardSession({
    wallet: { address: DEMO_WALLET_ADDRESS, provider: 'metamask' },
    balance: 0,
    earningBalance: 0,
    hasCompletedDeposit: false,
    recentActivity: [],
  })
  writeActivityPanelVisible(false)
  writeActivityUserHidden(false)
  window.location.assign(APP_DASHBOARD_V1_PATH)
}

export function returnToLanding(): void {
  clearDemoDashboardSession()
  window.location.assign(LANDING_PATH)
}

export function hasConnectedWalletSession(): boolean {
  try {
    const raw = window.sessionStorage.getItem('armada-app-demo-dashboard')
    if (!raw) return false
    const parsed = JSON.parse(raw) as { wallet?: { address?: string } | null }
    return Boolean(parsed.wallet?.address)
  } catch {
    return false
  }
}
