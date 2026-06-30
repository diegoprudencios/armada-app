import { aggregateHoldingsBalance, DEMO_USDC_BY_PROVIDER, holdingsForWallets } from '@/constants/walletMenu'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import { DEMO_ADDRESS_BY_PROVIDER, resolveDemoWalletAddress } from '@/pages/depositFlowConstants'
import type { DemoWallet } from '@/utils/demoDashboardSession'

export type ConnectedWallet = {
  id: string
  address: string
  provider: DemoWalletProvider
  usdcBalance: number
}

export function connectedWalletId(provider: DemoWalletProvider, address: string): string {
  return `${provider}-${address.toLowerCase()}`
}

export function createConnectedWallet(provider: DemoWalletProvider): ConnectedWallet | null {
  const address = resolveDemoWalletAddress(provider)
  if (!address) return null

  return {
    id: connectedWalletId(provider, address),
    address,
    provider,
    usdcBalance: DEMO_USDC_BY_PROVIDER[provider],
  }
}

export function aggregateUsdcBalance(wallets: readonly ConnectedWallet[]): number {
  const walletIds = wallets.map((wallet) => wallet.id)
  return aggregateHoldingsBalance(holdingsForWallets(walletIds))
}

export function demoWalletFromConnected(wallet: ConnectedWallet): DemoWallet {
  return { address: wallet.address, provider: wallet.provider }
}

export function normalizeConnectedWallets(
  wallets: unknown,
  activeWalletId: unknown,
  legacyWallet: DemoWallet | null,
): { wallets: ConnectedWallet[]; activeWalletId: string | null } {
  if (Array.isArray(wallets) && wallets.length > 0) {
    const parsed = wallets
      .map((entry) => normalizeConnectedWallet(entry))
      .filter((entry): entry is ConnectedWallet => entry !== null)

    const resolvedActive =
      typeof activeWalletId === 'string' && parsed.some((wallet) => wallet.id === activeWalletId)
        ? activeWalletId
        : parsed[0]?.id ?? null

    return { wallets: parsed, activeWalletId: resolvedActive }
  }

  if (legacyWallet?.address && legacyWallet.provider in DEMO_ADDRESS_BY_PROVIDER) {
    const provider = legacyWallet.provider as DemoWalletProvider
    const connected = createConnectedWallet(provider)
    if (!connected) return { wallets: [], activeWalletId: null }
    return { wallets: [connected], activeWalletId: connected.id }
  }

  return { wallets: [], activeWalletId: null }
}

function normalizeConnectedWallet(entry: unknown): ConnectedWallet | null {
  if (!entry || typeof entry !== 'object') return null

  const record = entry as Partial<ConnectedWallet>
  if (!record.id || !record.address || !record.provider) return null
  if (!(record.provider in DEMO_ADDRESS_BY_PROVIDER)) return null

  return {
    id: record.id,
    address: record.address,
    provider: record.provider as DemoWalletProvider,
    usdcBalance:
      typeof record.usdcBalance === 'number'
        ? record.usdcBalance
        : DEMO_USDC_BY_PROVIDER[record.provider as DemoWalletProvider],
  }
}
