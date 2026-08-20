export const THEME_STORAGE_KEY = 'armada-theme'
export const THEME_TRANSITION_MS = 320

export type Theme = 'light' | 'dark'

/** Default when the user has not chosen. Dark is available on this preview branch. */
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
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getAppliedTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'dark' ? 'dark' : 'light'
}

function themeFromQuery(): Theme | null {
  try {
    const value = new URLSearchParams(window.location.search).get('theme')
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

/** Apply theme to the document and persist an explicit user choice. */
export function setTheme(theme: Theme, options?: { animate?: boolean }): void {
  const root = document.documentElement
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const current = root.getAttribute('data-theme')
  const shouldAnimate =
    (options?.animate ?? true) && !reducedMotion && current !== null && current !== theme

  if (shouldAnimate) {
    root.setAttribute('data-theme-transition', '')
  }

  root.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore quota / private mode
  }
  window.dispatchEvent(new CustomEvent('theme-change'))

  if (shouldAnimate) {
    window.setTimeout(() => {
      root.removeAttribute('data-theme-transition')
    }, THEME_TRANSITION_MS)
  }
}

export function initTheme(): void {
  setTheme(themeFromQuery() ?? getSavedTheme() ?? DEFAULT_THEME, { animate: false })
}
