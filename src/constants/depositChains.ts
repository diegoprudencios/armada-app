import NetworkArbitrumSepolia from '@web3icons/react/icons/networks/NetworkArbitrumSepolia'
import NetworkBaseSepolia from '@web3icons/react/icons/networks/NetworkBaseSepolia'
import NetworkSepolia from '@web3icons/react/icons/networks/NetworkSepolia'

export type DepositChainId = 'sepolia' | 'base' | 'arbitrum'

/** @web3icons/react network icons for deposit chain pickers and activity rows. */
export const DEPOSIT_CHAIN_ICONS: Record<DepositChainId, typeof NetworkSepolia> = {
  sepolia: NetworkSepolia,
  base: NetworkBaseSepolia,
  arbitrum: NetworkArbitrumSepolia,
}
