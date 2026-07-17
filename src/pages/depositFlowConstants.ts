import type { DepositChainId } from '@/constants/depositChains'

export const DEPOSIT_PROGRESS_STEPS = ['Amount', 'Review', 'Wallet', 'Confirm'] as const

export const DEPOSIT_WALLET_BALANCE = '123283.23'
export const DEPOSIT_FEE = '0.00'

export const DEMO_WALLET_ADDRESS = '0x6545454534534534534534534534534534534'
export const DEMO_ARMADA_ADDRESS = 'zK6545454534534534534534534534534534534'

export type DemoWalletProvider = 'metamask' | 'phantom' | 'walletconnect'

export const DEMO_ADDRESS_BY_PROVIDER: Record<DemoWalletProvider, string> = {
  metamask: DEMO_WALLET_ADDRESS,
  phantom: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  walletconnect: '0x8ba1f109551bD432803012645Ac136c22C929e',
}

export function resolveDemoWalletAddress(provider: string): string | null {
  if (provider in DEMO_ADDRESS_BY_PROVIDER) {
    return DEMO_ADDRESS_BY_PROVIDER[provider as DemoWalletProvider]
  }
  return null
}

export const CHAIN_LABELS: Record<DepositChainId, string> = {
  sepolia: 'Sepolia',
  base: 'Base',
  arbitrum: 'Arbitrum',
}

/** Full network names for deposit review summary (armada-interface ShieldDepositSummary). */
export const NETWORK_DISPLAY_NAMES: Record<DepositChainId, string> = {
  sepolia: 'Ethereum Sepolia',
  base: 'Base Sepolia',
  arbitrum: 'Arbitrum Sepolia',
}

export function chainLabel(chain: DepositChainId): string {
  return CHAIN_LABELS[chain]
}

export function networkDisplayName(chain: DepositChainId): string {
  return NETWORK_DISPLAY_NAMES[chain]
}

export { DEPOSIT_CHAIN_ICONS } from '@/constants/depositChains'
