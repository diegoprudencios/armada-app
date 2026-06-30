import type { DepositChainId } from '@/components/DepositAmountCard'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import { DEMO_ADDRESS_BY_PROVIDER } from '@/pages/depositFlowConstants'
import { connectedWalletId } from '@/utils/walletMenu'

export const DEMO_USDC_BY_PROVIDER: Record<DemoWalletProvider, number> = {
  metamask: 123_283.23,
  phantom: 4_520.5,
  walletconnect: 890.12,
}

export type WalletMenuTab = 'tokens' | 'activity'

export type WalletUsdcHolding = {
  id: string
  walletId: string
  chain: DepositChainId
  balance: number
}

/** Demo USDC balances split by wallet and chain. */
export const DEMO_USDC_HOLDINGS: readonly WalletUsdcHolding[] = [
  {
    id: 'holding-metamask-sepolia',
    walletId: connectedWalletId('metamask', DEMO_ADDRESS_BY_PROVIDER.metamask),
    chain: 'sepolia',
    balance: 100_000,
  },
  {
    id: 'holding-metamask-base',
    walletId: connectedWalletId('metamask', DEMO_ADDRESS_BY_PROVIDER.metamask),
    chain: 'base',
    balance: 15_283.23,
  },
  {
    id: 'holding-metamask-arbitrum',
    walletId: connectedWalletId('metamask', DEMO_ADDRESS_BY_PROVIDER.metamask),
    chain: 'arbitrum',
    balance: 8_000,
  },
  {
    id: 'holding-phantom-base',
    walletId: connectedWalletId('phantom', DEMO_ADDRESS_BY_PROVIDER.phantom),
    chain: 'base',
    balance: 4_000,
  },
  {
    id: 'holding-phantom-sepolia',
    walletId: connectedWalletId('phantom', DEMO_ADDRESS_BY_PROVIDER.phantom),
    chain: 'sepolia',
    balance: 520.5,
  },
  {
    id: 'holding-walletconnect-arbitrum',
    walletId: connectedWalletId('walletconnect', DEMO_ADDRESS_BY_PROVIDER.walletconnect),
    chain: 'arbitrum',
    balance: 500,
  },
  {
    id: 'holding-walletconnect-base',
    walletId: connectedWalletId('walletconnect', DEMO_ADDRESS_BY_PROVIDER.walletconnect),
    chain: 'base',
    balance: 390.12,
  },
] as const

export function holdingsForWallets(
  walletIds: readonly string[],
  holdings: readonly WalletUsdcHolding[] = DEMO_USDC_HOLDINGS,
): WalletUsdcHolding[] {
  const allowed = new Set(walletIds)
  return holdings
    .filter((holding) => allowed.has(holding.walletId))
    .sort((a, b) => b.balance - a.balance)
}

export function walletHoldingBalance(
  walletId: string,
  holdings: readonly WalletUsdcHolding[] = DEMO_USDC_HOLDINGS,
): number {
  return holdings
    .filter((holding) => holding.walletId === walletId)
    .reduce((sum, holding) => sum + holding.balance, 0)
}

/** Demo deposit chain for the Ethereum-only wallet panel (v01). */
export const WALLET_PANEL_ETHEREUM_CHAIN: DepositChainId = 'sepolia'

export const WALLET_PANEL_ETHEREUM_NETWORK_LABEL = 'Ethereum'

export function ethereumUsdcBalanceForWallet(
  walletId: string,
  holdings: readonly WalletUsdcHolding[] = DEMO_USDC_HOLDINGS,
): number {
  return holdings
    .filter(
      (holding) => holding.walletId === walletId && holding.chain === WALLET_PANEL_ETHEREUM_CHAIN,
    )
    .reduce((sum, holding) => sum + holding.balance, 0)
}

export function aggregateHoldingsBalance(
  holdings: readonly WalletUsdcHolding[],
): number {
  return holdings.reduce((sum, holding) => sum + holding.balance, 0)
}

export type WalletActivityKind = 'send' | 'receive' | 'approve' | 'swap'

export type WalletActivityItem = {
  id: string
  walletId: string
  kind: WalletActivityKind
  label: string
  amount: number
  occurredAt: number
  chain: string
}

/** Demo on-chain wallet activity — production would fetch from indexer / RPC. */
export const DEMO_WALLET_ACTIVITY: readonly WalletActivityItem[] = [
  {
    id: 'wallet-activity-1',
    walletId: connectedWalletId('metamask', DEMO_ADDRESS_BY_PROVIDER.metamask),
    kind: 'receive',
    label: 'Received USDC',
    amount: 2500,
    occurredAt: Date.now() - 2 * 60 * 60 * 1000,
    chain: 'Ethereum',
  },
  {
    id: 'wallet-activity-2',
    walletId: connectedWalletId('metamask', DEMO_ADDRESS_BY_PROVIDER.metamask),
    kind: 'send',
    label: 'Sent USDC',
    amount: -420,
    occurredAt: Date.now() - 26 * 60 * 60 * 1000,
    chain: 'Ethereum',
  },
  {
    id: 'wallet-activity-3',
    walletId: connectedWalletId('phantom', DEMO_ADDRESS_BY_PROVIDER.phantom),
    kind: 'receive',
    label: 'Received USDC',
    amount: 180,
    occurredAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    chain: 'Base',
  },
  {
    id: 'wallet-activity-4',
    walletId: connectedWalletId('walletconnect', DEMO_ADDRESS_BY_PROVIDER.walletconnect),
    kind: 'approve',
    label: 'Approved USDC spend',
    amount: 0,
    occurredAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    chain: 'Arbitrum',
  },
  {
    id: 'wallet-activity-5',
    walletId: connectedWalletId('walletconnect', DEMO_ADDRESS_BY_PROVIDER.walletconnect),
    kind: 'swap',
    label: 'Swapped USDC',
    amount: -75.5,
    occurredAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    chain: 'Arbitrum',
  },
] as const

export function walletActivityForWallets(
  walletIds: readonly string[],
  items: readonly WalletActivityItem[] = DEMO_WALLET_ACTIVITY,
): WalletActivityItem[] {
  const allowed = new Set(walletIds)
  return items
    .filter((item) => allowed.has(item.walletId))
    .sort((a, b) => b.occurredAt - a.occurredAt)
}

export function providerLabel(provider: DemoWalletProvider): string {
  switch (provider) {
    case 'metamask':
      return 'MetaMask'
    case 'phantom':
      return 'Phantom'
    case 'walletconnect':
      return 'WalletConnect'
    default:
      return 'Wallet'
  }
}

export function demoUsdcBalanceForProvider(provider: DemoWalletProvider): number {
  return DEMO_USDC_BY_PROVIDER[provider]
}
