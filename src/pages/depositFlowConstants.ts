import type { DepositChainId } from '@/constants/depositChains'

export const DEPOSIT_PROGRESS_STEPS = ['Amount', 'Review', 'Wallet', 'Confirm'] as const

export const DEPOSIT_WALLET_BALANCE = '10000'
export const DEPOSIT_FEE = '0.00'

export const DEMO_ARMADA_ADDRESS = 'zK6545454534534534534534534534534534534'

export {
  DEMO_WALLET_ADDRESS,
  DEMO_ADDRESS_BY_PROVIDER,
  resolveDemoWalletAddress,
  type DemoWalletProvider,
} from '@/constants/demoWallets'

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
