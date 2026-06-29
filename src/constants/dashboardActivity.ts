import type { DepositChainId } from '@/components/DepositAmountCard'
import type { EarnTab } from '@/pages/earnFlowConstants'
import type { SendChainId } from '@/pages/sendFlowConstants'

export type DashboardActivityKind = 'send' | 'deposit' | 'earn' | 'withdraw'

export type DashboardSendActivityItem = {
  id: string
  kind: 'send'
  label: string
  amount: number
  occurredAt: number
  recipient: string
  chain: SendChainId
  txHash: string
}

export type DashboardDepositActivityItem = {
  id: string
  kind: 'deposit'
  label: string
  amount: number
  occurredAt: number
  chain: DepositChainId
  txHash: string
}

export type DashboardEarnActivityItem = {
  id: string
  kind: 'earn'
  label: string
  amount: number
  occurredAt: number
  tab: EarnTab
  txHash: string
}

export type DashboardWithdrawActivityItem = {
  id: string
  kind: 'withdraw'
  label: string
  amount: number
  occurredAt: number
  chain: SendChainId
  recipient: string
  txHash: string
}

export type DashboardActivityItem =
  | DashboardSendActivityItem
  | DashboardDepositActivityItem
  | DashboardEarnActivityItem
  | DashboardWithdrawActivityItem

export const MAX_RECENT_ACTIVITY_ITEMS = 20
