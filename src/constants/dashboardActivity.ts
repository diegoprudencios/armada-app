import type { DepositChainId } from '@/components/DepositAmountCard'
import type { EarnTab } from '@/pages/earnFlowConstants'
import type { SendChainId } from '@/pages/sendFlowConstants'

export type DashboardActivityKind =
  | 'send'
  | 'deposit'
  | 'earn'
  | 'withdraw'
  | 'requestLink'
  | 'receiveLink'
  | 'receive'

export type RequestLinkActivityStatus = 'pending' | 'paid' | 'revoked' | 'expired'

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

export type DashboardRequestLinkActivityItem = {
  id: string
  kind: 'requestLink'
  label: string
  amount: number
  occurredAt: number
  requestId: string
  paymentLink: string
  expiresAt: number
  requestedAmount: number
  note?: string
  status: RequestLinkActivityStatus
  paidAt?: number
  paidAmount?: number
  txHash?: string
}

export type DashboardReceiveLinkActivityItem = {
  id: string
  kind: 'receiveLink'
  label: string
  amount: number
  occurredAt: number
  requestId: string
  paidAmount: number
  note?: string
  txHash: string
}

export type DashboardReceiveActivityItem = {
  id: string
  kind: 'receive'
  label: string
  amount: number
  occurredAt: number
  sender: string
  chain: SendChainId
  txHash: string
}

export type DashboardActivityItem =
  | DashboardSendActivityItem
  | DashboardDepositActivityItem
  | DashboardEarnActivityItem
  | DashboardWithdrawActivityItem
  | DashboardRequestLinkActivityItem
  | DashboardReceiveLinkActivityItem
  | DashboardReceiveActivityItem

export const MAX_RECENT_ACTIVITY_ITEMS = 20
