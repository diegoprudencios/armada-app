import NetworkArbitrumSepolia from '@web3icons/react/icons/networks/NetworkArbitrumSepolia'
import NetworkBaseSepolia from '@web3icons/react/icons/networks/NetworkBaseSepolia'
import NetworkSepolia from '@web3icons/react/icons/networks/NetworkSepolia'
import type { DepositChainId } from './DepositAmountCard'

export const DEPOSIT_CHAIN_ICONS: Record<
  DepositChainId,
  typeof NetworkSepolia
> = {
  sepolia: NetworkSepolia,
  base: NetworkBaseSepolia,
  arbitrum: NetworkArbitrumSepolia,
}
