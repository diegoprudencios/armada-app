import type { DepositChainId } from '@/components/DepositAmountCard'
import {
  MAX_RECENT_ACTIVITY_ITEMS,
  type DashboardActivityItem,
  type DashboardDepositActivityItem,
  type DashboardEarnActivityItem,
  type DashboardSendActivityItem,
  type DashboardWithdrawActivityItem,
} from '@/constants/dashboardActivity'
import { networkDisplayName } from '@/pages/depositFlowConstants'
import type { EarnTab } from '@/pages/earnFlowConstants'
import { isArmadaAddress, sendNetworkDisplayName, type SendChainId } from '@/pages/sendFlowConstants'
import { truncateAddress } from '@/utils/format'

export function createActivityId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createSendActivity(
  amount: number,
  recipient: string,
  chain: SendChainId,
): DashboardSendActivityItem {
  const trimmed = recipient.trim()
  const label = isArmadaAddress(trimmed)
    ? 'Sent to private address'
    : `Sent to ${truncateAddress(trimmed)}`

  return {
    id: createActivityId(),
    kind: 'send',
    label,
    amount: -amount,
    occurredAt: Date.now(),
    recipient: trimmed,
    chain,
  }
}

export function createDepositActivity(
  amount: number,
  chain: DepositChainId,
): DashboardDepositActivityItem {
  return {
    id: createActivityId(),
    kind: 'deposit',
    label: `Deposit from ${networkDisplayName(chain)}`,
    amount,
    occurredAt: Date.now(),
    chain,
  }
}

export function createEarnActivity(amount: number, tab: EarnTab): DashboardEarnActivityItem {
  if (tab === 'add') {
    return {
      id: createActivityId(),
      kind: 'earn',
      label: 'Added to earn vault',
      amount: -amount,
      occurredAt: Date.now(),
      tab,
    }
  }

  return {
    id: createActivityId(),
    kind: 'earn',
    label: 'Withdrawn from earn vault',
    amount,
    occurredAt: Date.now(),
    tab,
  }
}

export function createWithdrawActivity(
  amount: number,
  chain: SendChainId,
  recipient: string,
): DashboardWithdrawActivityItem {
  return {
    id: createActivityId(),
    kind: 'withdraw',
    label: `Withdraw to ${sendNetworkDisplayName(chain)}`,
    amount: -amount,
    occurredAt: Date.now(),
    chain,
    recipient: recipient.trim(),
  }
}

export function prependActivity(
  items: readonly DashboardActivityItem[],
  item: DashboardActivityItem,
): DashboardActivityItem[] {
  return [item, ...items].slice(0, MAX_RECENT_ACTIVITY_ITEMS)
}

const SEND_CHAINS = new Set<SendChainId>(['ethereum', 'arbitrum', 'base'])
const DEPOSIT_CHAINS = new Set<DepositChainId>(['sepolia', 'base', 'arbitrum'])

export function isOpenableActivityItem(item: unknown): item is DashboardActivityItem {
  if (!item || typeof item !== 'object') return false

  const record = item as Record<string, unknown>
  if (
    typeof record.id !== 'string' ||
    typeof record.label !== 'string' ||
    typeof record.amount !== 'number' ||
    typeof record.occurredAt !== 'number'
  ) {
    return false
  }

  switch (record.kind) {
    case 'send':
      return (
        typeof record.recipient === 'string' &&
        typeof record.chain === 'string' &&
        SEND_CHAINS.has(record.chain as SendChainId)
      )
    case 'deposit':
      return typeof record.chain === 'string' && DEPOSIT_CHAINS.has(record.chain as DepositChainId)
    case 'earn':
      return record.tab === 'add' || record.tab === 'withdraw'
    case 'withdraw':
      return (
        typeof record.recipient === 'string' &&
        typeof record.chain === 'string' &&
        SEND_CHAINS.has(record.chain as SendChainId)
      )
    default:
      return false
  }
}

export function normalizeActivityItems(items: unknown): DashboardActivityItem[] {
  if (!Array.isArray(items)) return []
  return items.filter(isOpenableActivityItem)
}
