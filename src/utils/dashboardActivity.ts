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

export function createDemoTxHash(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}

function deriveDemoTxHash(seed: string): string {
  const hex = Array.from({ length: 64 }, (_, index) => {
    const code = seed.charCodeAt(index % seed.length)
    const mixed = Math.imul(code, index + 1) ^ seed.length
    return (Math.abs(mixed) % 16).toString(16)
  }).join('')

  return `0x${hex}`
}

export function resolveActivityTxHash(item: DashboardActivityItem): string {
  const record = item as DashboardActivityItem & { txHash?: string }
  if (record.txHash) return record.txHash
  return deriveDemoTxHash(item.id)
}

export function matchesActivityTxHashSearch(item: DashboardActivityItem, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase().replace(/^0x/, '')
  if (!normalizedQuery) return true

  const normalizedHash = resolveActivityTxHash(item).toLowerCase().replace(/^0x/, '')
  return normalizedHash.includes(normalizedQuery)
}

export function matchesActivityKindFilter(
  item: DashboardActivityItem,
  filter: 'all' | DashboardActivityItem['kind'],
): boolean {
  return filter === 'all' || item.kind === filter
}

function withResolvedTxHash(item: DashboardActivityItem): DashboardActivityItem {
  const record = item as DashboardActivityItem & { txHash?: string }
  if (record.txHash) return item
  return { ...item, txHash: deriveDemoTxHash(item.id) }
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
    txHash: createDemoTxHash(),
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
    txHash: createDemoTxHash(),
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
      txHash: createDemoTxHash(),
    }
  }

  return {
    id: createActivityId(),
    kind: 'earn',
    label: 'Withdrawn from earn vault',
    amount,
    occurredAt: Date.now(),
    tab,
    txHash: createDemoTxHash(),
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
    txHash: createDemoTxHash(),
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
  return items.filter(isOpenableActivityItem).map(withResolvedTxHash)
}
