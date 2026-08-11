/**
 * Homepage hero → privacy handoff scroll timing (desktop only).
 * Mobile uses a normal hero + privacy section — no pin / fade / fog push.
 * Keep CSS pin height / under-hero margin in sync with HERO_EXIT_SCRUB_SVH.
 *
 * Pin/sticky use `lvh` (largest viewport) so desktop browser chrome
 * collapsing doesn’t briefly flash the section under the hero.
 *
 * Ordered beats while the pin scrubs (progress 0→1):
 * 1) Hero fades → amber
 * 2) Hold amber briefly
 * 3) Privacy copy fades in (centered)
 * 4) After the pin, fog rises over sticky copy
 */
export const HERO_EXIT_SCRUB_SVH = 110

/** Sticky pin: large viewport + scrub for amber then copy. */
export const HERO_PIN_HEIGHT = `calc(100lvh + ${HERO_EXIT_SCRUB_SVH}svh)`

/** Pull privacy intro under the full pin. */
export const INTRO_UNDER_HERO_MARGIN = `calc(-100lvh - ${HERO_EXIT_SCRUB_SVH}svh)`

/**
 * Pin progress 0→1 (after smoothstep):
 * 1) Amber / hero out
 * 2) Privacy copy fades in
 * (Fog is layout-delayed after the pin via introHold.)
 */
export const HANDOFF = {
  amberEnd: 0.36,
  /** Amber holds alone until copy starts. */
  copyStart: 0.48,
  copyEnd: 0.72,
} as const

/**
 * Spacer above the fog (svh). Sticky copy stays alone until this clears —
 * must be past copyEnd × pin scrub (~79svh) so fog only rises once privacy
 * text is fully opaque, plus a short beat.
 */
export const INTRO_HOLD_BEFORE_FOG_SVH =
  Math.ceil(HANDOFF.copyEnd * HERO_EXIT_SCRUB_SVH) + 24

export function remap01(value: number, start: number, end: number) {
  if (end <= start) return value >= end ? 1 : 0
  return Math.min(1, Math.max(0, (value - start) / (end - start)))
}
