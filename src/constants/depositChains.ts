import NetworkArbitrumSepolia from '@web3icons/react/icons/networks/NetworkArbitrumSepolia'
import NetworkBaseSepolia from '@web3icons/react/icons/networks/NetworkBaseSepolia'
import NetworkSepolia from '@web3icons/react/icons/networks/NetworkSepolia'

export type DepositChainId = 'sepolia' | 'base' | 'arbitrum'

export const DEPOSIT_CHAIN_LABELS: Record<DepositChainId, string> = {
  sepolia: 'Sepolia',
  base: 'Base',
  arbitrum: 'Arbitrum',
}

export function depositChainLabel(chain: DepositChainId): string {
  return DEPOSIT_CHAIN_LABELS[chain]
}

/** Address explorer for the demo Sepolia family of chains. */
export function explorerAddressUrl(chain: DepositChainId, address: string): string {
  switch (chain) {
    case 'base':
      return `https://sepolia.basescan.org/address/${address}`
    case 'arbitrum':
      return `https://sepolia.arbiscan.io/address/${address}`
    case 'sepolia':
      return `https://sepolia.etherscan.io/address/${address}`
  }
}

/** @web3icons/react network icons for deposit chain pickers and activity rows. */
export const DEPOSIT_CHAIN_ICONS: Record<DepositChainId, typeof NetworkSepolia> = {
  sepolia: NetworkSepolia,
  base: NetworkBaseSepolia,
  arbitrum: NetworkArbitrumSepolia,
}
