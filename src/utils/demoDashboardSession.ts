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
  activityVisible: boolean
}

const STORAGE_KEY = 'armada-app-demo-dashboard'
const STORAGE_VERSION = 1 as const

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
      activityVisible: parsed.activityVisible ?? false,
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
}
