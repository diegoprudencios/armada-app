export const DASHBOARD_BG_STORAGE_KEY = 'armada-dashboard-background'

export type DashboardBackground = 'gradient' | 'solid'

export const DASHBOARD_SOLID_BG = 'var(--primitives-color-neutral-0)'

function isDashboardBackground(value: string | null): value is DashboardBackground {
  return value === 'gradient' || value === 'solid'
}

export function getSavedDashboardBackground(): DashboardBackground | null {
  try {
    const saved = localStorage.getItem(DASHBOARD_BG_STORAGE_KEY)
    return isDashboardBackground(saved) ? saved : null
  } catch {
    return null
  }
}

export function getAppliedDashboardBackground(): DashboardBackground {
  const attr = document.documentElement.getAttribute('data-dashboard-bg')
  return attr === 'solid' ? 'solid' : 'gradient'
}

export function setDashboardBackground(background: DashboardBackground): void {
  document.documentElement.setAttribute('data-dashboard-bg', background)
  try {
    localStorage.setItem(DASHBOARD_BG_STORAGE_KEY, background)
  } catch {
    // ignore quota / private mode
  }
  window.dispatchEvent(new CustomEvent('dashboard-background-change'))
}

export function initDashboardBackground(): void {
  setDashboardBackground(getSavedDashboardBackground() ?? 'gradient')
}
