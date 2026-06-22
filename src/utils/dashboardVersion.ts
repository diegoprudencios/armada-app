export type DashboardVersion = 'v1' | 'v2'

export const DASHBOARD_VERSION_PATHS: Record<DashboardVersion, string> = {
  v1: '/dashboard',
  v2: '/dashboard-v2',
}

export function getDashboardVersionFromPath(pathname = window.location.pathname): DashboardVersion {
  return pathname.includes('dashboard-v2') ? 'v2' : 'v1'
}
