import type { TestingDeviceInfo } from './types'

function parsePlatformFromUserAgent(userAgent: string): string {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/Windows/i.test(userAgent)) return 'Windows'
  if (/Mac OS X|Macintosh/i.test(userAgent)) return 'macOS'
  if (/CrOS/i.test(userAgent)) return 'Chrome OS'
  if (/Linux/i.test(userAgent)) return 'Linux'
  return 'Unknown'
}

/** Capture once at session start — client-side only, no network. */
export function captureDeviceInfo(): TestingDeviceInfo {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string }
  }
  const platform =
    nav.userAgentData?.platform?.trim() ||
    parsePlatformFromUserAgent(userAgent)

  return {
    userAgent,
    platform,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  }
}
