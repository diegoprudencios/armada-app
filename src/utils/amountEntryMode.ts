import type { AmountInputEntryMode } from '@/components/AmountInputScreen'
import { MOBILE_LAYOUT_MAX_WIDTH_PX } from '@/constants/viewportBreakpoints'

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(`(max-width: ${MOBILE_LAYOUT_MAX_WIDTH_PX}px)`).matches
}

/**
 * Resolve amount entry UI mode.
 * - Mobile: keypad by default
 * - Desktop: system keyboard by default
 * - Override: `?keypad=1` force keypad, `?keypad=0` force input
 */
export function resolveAmountEntryMode(search = window.location.search): AmountInputEntryMode {
  const value = new URLSearchParams(search).get('keypad')
  if (value === '0' || value === 'false') return 'input'
  if (value === '1' || value === 'true') return 'keypad'
  return isMobileViewport() ? 'keypad' : 'input'
}

/** True when mobile keypad chrome / chooser-first flows should run. */
export function shouldUseKeypadMobileChrome(search = window.location.search): boolean {
  return resolveAmountEntryMode(search) === 'keypad' && isMobileViewport()
}
