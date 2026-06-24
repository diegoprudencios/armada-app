import type { DashboardActivityItem } from '@/constants/dashboardActivity'

export type DemoWallet = {
  address: string
  provider: string
}

export type DemoDashboardSession = {
  version: 1
  wallet: DemoWallet | null
  balance: number
  earningBalance: number
  hasCompletedDeposit: boolean
  recentActivity: DashboardActivityItem[]
}

const STORAGE_KEY = 'armada-app-demo-dashboard'
const ACTIVITY_VISIBLE_KEY = 'armada-app-dashboard-activity-visible'
const STORAGE_VERSION = 1 as const

/** Activity panel is hidden by default; only shown after the user opts in. */
export function readActivityPanelVisible(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return sessionStorage.getItem(ACTIVITY_VISIBLE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeActivityPanelVisible(visible: boolean): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(ACTIVITY_VISIBLE_KEY, visible ? 'true' : 'false')
  } catch {
    // ignore quota / private mode
  }
}

export function readDemoDashboardSession(): DemoDashboardSession | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as DemoDashboardSession
    if (parsed.version !== STORAGE_VERSION) return null

    return {
      version: STORAGE_VERSION,
      wallet: parsed.wallet,
      balance: parsed.balance ?? 0,
      earningBalance: parsed.earningBalance ?? 0,
      hasCompletedDeposit: parsed.hasCompletedDeposit ?? false,
      recentActivity: parsed.recentActivity ?? [],
    }
  } catch {
    return null
  }
}

export function writeDemoDashboardSession(session: Omit<DemoDashboardSession, 'version'>): void {
  if (typeof window === 'undefined') return

  const payload: DemoDashboardSession = {
    version: STORAGE_VERSION,
    ...session,
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function clearDemoDashboardSession(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(STORAGE_KEY)
  window.sessionStorage.removeItem(ACTIVITY_VISIBLE_KEY)
}
