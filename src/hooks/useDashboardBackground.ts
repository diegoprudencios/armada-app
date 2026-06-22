import { useCallback, useSyncExternalStore } from 'react'
import {
  DASHBOARD_BG_STORAGE_KEY,
  getAppliedDashboardBackground,
  setDashboardBackground,
  type DashboardBackground,
} from '@/utils/dashboardBackground'

function subscribeToDashboardBackground(onStoreChange: () => void) {
  const onBackgroundChange = () => onStoreChange()
  const onStorage = (event: StorageEvent) => {
    if (event.key === DASHBOARD_BG_STORAGE_KEY) onStoreChange()
  }

  window.addEventListener('dashboard-background-change', onBackgroundChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener('dashboard-background-change', onBackgroundChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function useDashboardBackground() {
  const background = useSyncExternalStore(
    subscribeToDashboardBackground,
    getAppliedDashboardBackground,
    () => 'gradient' as DashboardBackground,
  )
  const applyBackground = useCallback(
    (next: DashboardBackground) => setDashboardBackground(next),
    [],
  )
  return [background, applyBackground] as const
}
