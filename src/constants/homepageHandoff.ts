/**
 * Homepage hero → privacy handoff scroll timing.
 * Keep CSS pin height / under-hero margin in sync with HERO_EXIT_SCRUB_SVH.
 */
export const HERO_EXIT_SCRUB_SVH = 110

/** Sticky pin: one viewport + scrub for amber then copy. */
export const HERO_PIN_HEIGHT = `calc(100svh + ${HERO_EXIT_SCRUB_SVH}svh)`

/** Pull privacy intro under the full pin. */
export const INTRO_UNDER_HERO_MARGIN = `calc(-100svh - ${HERO_EXIT_SCRUB_SVH}svh)`

/** Hold amber with copy visible before fog enters (inside intro). */
export const INTRO_HOLD_BEFORE_FOG_SVH = 55

/**
 * Pin progress 0→1 (after smoothstep):
 * 1) Amber / hero out
 * 2) Privacy copy fades in
 * (Fog is layout-delayed after the pin via introHold.)
 */
export const HANDOFF = {
  amberEnd: 0.34,
  copyStart: 0.4,
  copyEnd: 0.68,
} as const

export function remap01(value: number, start: number, end: number) {
  if (end <= start) return value >= end ? 1 : 0
  return Math.min(1, Math.max(0, (value - start) / (end - start)))
}
