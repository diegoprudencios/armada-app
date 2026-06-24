import type { DepositChainId } from '@/components/DepositAmountCard'
import {
  MAX_RECENT_ACTIVITY_ITEMS,
  type DashboardActivityItem,
} from '@/constants/dashboardActivity'
import { networkDisplayName } from '@/pages/depositFlowConstants'
import type { EarnTab } from '@/pages/earnFlowConstants'
import { isArmadaAddress } from '@/pages/sendFlowConstants'
import { truncateAddress } from '@/utils/format'

export function createActivityId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createSendActivity(amount: number, recipient: string): DashboardActivityItem {
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
  }
}

export function createDepositActivity(
  amount: number,
  chain: DepositChainId,
): DashboardActivityItem {
  return {
    id: createActivityId(),
    kind: 'deposit',
    label: `Deposit from ${networkDisplayName(chain)}`,
    amount,
    occurredAt: Date.now(),
  }
}

export function createEarnActivity(amount: number, tab: EarnTab): DashboardActivityItem {
  if (tab === 'add') {
    return {
      id: createActivityId(),
      kind: 'earn',
      label: 'Added to earn vault',
      amount: -amount,
      occurredAt: Date.now(),
    }
  }

  return {
    id: createActivityId(),
    kind: 'earn',
    label: 'Withdrawn from earn vault',
    amount,
    occurredAt: Date.now(),
  }
}

export function prependActivity(
  items: readonly DashboardActivityItem[],
  item: DashboardActivityItem,
): DashboardActivityItem[] {
  return [item, ...items].slice(0, MAX_RECENT_ACTIVITY_ITEMS)
}
