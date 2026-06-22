export const THEME_STORAGE_KEY = 'armada-theme'

export type Theme = 'light' | 'dark'

/** Light mode only for now — dark theme is disabled until refined. */
export const DEFAULT_THEME: Theme = 'light'

export function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

export function getSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(saved) ? saved : null
  } catch {
    return null
  }
}

export function getSystemTheme(): Theme {
  return DEFAULT_THEME
}

export function getAppliedTheme(): Theme {
  return DEFAULT_THEME
}

export function initTheme(): void {
  document.documentElement.setAttribute('data-theme', DEFAULT_THEME)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME)
  } catch {
    // ignore quota / private mode
  }
}

/** Always applies light mode while dark theme is hidden. */
export function setTheme(_theme: Theme): void {
  initTheme()
}
