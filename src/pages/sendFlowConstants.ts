import NetworkArbitrumOne from '@web3icons/react/icons/networks/NetworkArbitrumOne'
import NetworkBase from '@web3icons/react/icons/networks/NetworkBase'
import NetworkEthereum from '@web3icons/react/icons/networks/NetworkEthereum'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'

export const SEND_PROGRESS_STEPS = ['Recipient', 'Amount', 'Review', 'Confirm'] as const

/** Withdraw keeps the same progress path as send (no wallet step — funds leave Armada). */
export const WITHDRAW_PROGRESS_STEPS = ['Recipient', 'Amount', 'Review', 'Confirm'] as const

export type SendChainId = 'ethereum' | 'arbitrum' | 'base'

export const DEMO_ZK_RECIPIENT =
  'zk928927wshw738whs73673wbs8373hw8733e98s78d2f9a1b4c6e8f0a2b4c6d8'

export const DEMO_0X_RECIPIENT = '0x928927a8b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6'

export const RECENT_SEND_ADDRESSES: ReadonlyArray<{
  address: string
  sentAgo: string
}> = [
  { address: '0x82a7f3c91d4e5b6a7081928374655647382910a2b3c4d5e6f728', sentAgo: '2 days ago' },
  { address: '0x41c2e8f90a1b3d5e7f9a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6', sentAgo: '5 days ago' },
  { address: DEMO_ARMADA_ADDRESS, sentAgo: '1 week ago' },
]

export const SEND_CHAIN_OPTIONS: ReadonlyArray<{
  id: SendChainId
  label: string
  displayName: string
  Icon: typeof NetworkEthereum
}> = [
  { id: 'ethereum', label: 'Ethereum', displayName: 'Ethereum', Icon: NetworkEthereum },
  { id: 'arbitrum', label: 'Arbitrum', displayName: 'Arbitrum', Icon: NetworkArbitrumOne },
  { id: 'base', label: 'Base', displayName: 'Base', Icon: NetworkBase },
]

export function sendNetworkDisplayName(chain: SendChainId): string {
  return SEND_CHAIN_OPTIONS.find((option) => option.id === chain)?.displayName ?? chain
}

export function isArmadaAddress(address: string): boolean {
  return address.trim().toLowerCase().startsWith('zk')
}

export function isPublicAddress(address: string): boolean {
  return address.trim().toLowerCase().startsWith('0x')
}

export function isValidRecipientAddress(address: string): boolean {
  const trimmed = address.trim()
  if (!trimmed) return false
  return isArmadaAddress(trimmed) || isPublicAddress(trimmed)
}

export type SendFlowVariant = 'send' | 'withdraw'

export function sendRecipientTitleLead(variant: SendFlowVariant): string {
  return variant === 'withdraw' ? 'Where do you want to' : 'Who do you want to'
}

export const SEND_RECIPIENT_TITLE_TAIL = 'send your USDC?'

export function sendReviewTitle(variant: SendFlowVariant): string {
  return variant === 'withdraw' ? 'Review your withdrawal' : 'Review transfer'
}

export function sendReviewConfirmLabel(variant: SendFlowVariant): string {
  return variant === 'withdraw' ? 'Confirm withdrawal' : 'Confirm send'
}

export function sendConfirmedTitle(variant: SendFlowVariant): string {
  return variant === 'withdraw' ? 'Withdrawal complete' : 'Send confirmed'
}

export function sendWalletSignLabel(variant: SendFlowVariant): string {
  return variant === 'withdraw' ? 'Sign withdrawal transaction' : 'Sign send transaction'
}

export function sendProcessingFinalStageLabel(variant: SendFlowVariant): string {
  return variant === 'withdraw' ? 'Withdrawn' : 'Sent'
}

export function sendProcessingKind(variant: SendFlowVariant): string {
  return variant === 'withdraw' ? 'unshield-local' : 'send'
}

/** Processing copy bucket for send — private Armada, external 0x, or withdraw flow. */
export type SendProcessingCopyMode = 'private' | 'external' | 'withdraw'

export function sendProcessingCopyMode(
  variant: SendFlowVariant,
  recipient?: string,
): SendProcessingCopyMode {
  if (variant === 'withdraw') return 'withdraw'
  if (recipient && isArmadaAddress(recipient)) return 'private'
  return 'external'
}
