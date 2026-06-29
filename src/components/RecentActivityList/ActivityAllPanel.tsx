import { useEffect, useMemo, useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { SidePanel } from '@/components/SidePanel'
import type { DashboardActivityItem } from '@/constants/dashboardActivity'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { matchesActivityKindFilter, matchesActivityTxHashSearch } from '@/utils/dashboardActivity'
import { ActivityKindFilters, type ActivityKindFilter } from './ActivityKindFilters'
import { ActivityTxHashSearch } from './ActivityTxHashSearch'
import searchStyles from './ActivityTxHashSearch.module.css'
import { RecentActivityList } from './RecentActivityList'

export interface ActivityAllPanelProps {
  open: boolean
  onClose: () => void
  items: readonly DashboardActivityItem[]
  balanceRevealed?: boolean
  onItemClick?: (item: DashboardActivityItem) => void
}

export function ActivityAllPanel({
  open,
  onClose,
  items,
  balanceRevealed = true,
  onItemClick,
}: ActivityAllPanelProps) {
  const isMobile = useMobileLayout()
  const [hashQuery, setHashQuery] = useState('')
  const [kindFilter, setKindFilter] = useState<ActivityKindFilter>('all')

  useEffect(() => {
    if (!open) {
      setHashQuery('')
      setKindFilter('all')
    }
  }, [open])

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) => matchesActivityTxHashSearch(item, hashQuery) && matchesActivityKindFilter(item, kindFilter),
      ),
    [items, hashQuery, kindFilter],
  )

  const hasActiveFilters = hashQuery.trim().length > 0 || kindFilter !== 'all'
  const showFilterEmpty = hasActiveFilters && filteredItems.length === 0

  function handleItemClick(item: DashboardActivityItem) {
    onItemClick?.(item)
    onClose()
  }

  const list = (
    <>
      <ActivityTxHashSearch value={hashQuery} onChange={setHashQuery} />
      <ActivityKindFilters value={kindFilter} onChange={setKindFilter} />
      {showFilterEmpty ? (
        <p className={searchStyles.searchEmpty}>No transactions match your filters.</p>
      ) : (
        <RecentActivityList
          variant="full"
          items={filteredItems}
          balanceRevealed={balanceRevealed}
          onItemClick={handleItemClick}
        />
      )}
    </>
  )

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Recent activity">
        {list}
      </BottomSheet>
    )
  }

  return (
    <SidePanel open={open} onClose={onClose} title="Recent activity">
      {list}
    </SidePanel>
  )
}
