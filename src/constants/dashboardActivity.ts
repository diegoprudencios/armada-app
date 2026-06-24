export type DashboardActivityKind = 'send' | 'deposit' | 'earn' | 'receive'

export type DashboardActivityItem = {
  id: string
  kind: DashboardActivityKind
  label: string
  amount: number
  timeAgo: string
}

export const DEMO_RECENT_ACTIVITY: readonly DashboardActivityItem[] = [
  {
    id: 'activity-send-1',
    kind: 'send',
    label: 'Sent to private address',
    amount: -250,
    timeAgo: '2 hours ago',
  },
  {
    id: 'activity-deposit-1',
    kind: 'deposit',
    label: 'Deposit from Ethereum',
    amount: 1000,
    timeAgo: '1 day ago',
  },
  {
    id: 'activity-earn-1',
    kind: 'earn',
    label: 'Added to earn vault',
    amount: -500,
    timeAgo: '3 days ago',
  },
  {
    id: 'activity-receive-1',
    kind: 'receive',
    label: 'Received from 0x41c2...2f4a6',
    amount: 150,
    timeAgo: '5 days ago',
  },
]
