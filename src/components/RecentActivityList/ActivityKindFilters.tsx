import { SegmentedControl } from '@/components/SegmentedControl'
import type { DashboardActivityKind } from '@/constants/dashboardActivity'

export type ActivityKindFilter =
  | 'all'
  | 'received'
  | Exclude<DashboardActivityKind, 'receive' | 'receiveLink'>

const FILTERS: Array<{ id: ActivityKindFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'send', label: 'Sent' },
  { id: 'requestLink', label: 'Requests' },
  { id: 'received', label: 'Received' },
  { id: 'earn', label: 'Earn' },
]

export interface ActivityKindFiltersProps {
  value: ActivityKindFilter
  onChange: (value: ActivityKindFilter) => void
  surface?: 'frost' | 'raised'
}

export function ActivityKindFilters({ value, onChange, surface = 'raised' }: ActivityKindFiltersProps) {
  return (
    <SegmentedControl
      options={FILTERS}
      value={value}
      onChange={onChange}
      size="sm"
      layout="scroll"
      surface={surface}
      aria-label="Filter by transaction type"
    />
  )
}
