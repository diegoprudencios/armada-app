export type DashboardActivityKind = 'send' | 'deposit' | 'earn'

export type DashboardActivityItem = {
  id: string
  kind: DashboardActivityKind
  label: string
  amount: number
  occurredAt: number
}

export const MAX_RECENT_ACTIVITY_ITEMS = 20
