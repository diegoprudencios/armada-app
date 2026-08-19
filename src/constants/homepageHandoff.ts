/**
 * Homepage hero → privacy handoff scroll timing (desktop only).
 * Mobile uses a normal hero + privacy section — no pin / fade.
 * Keep CSS pin height / under-hero margin in sync with HERO_EXIT_SCRUB_SVH.
 *
 * Ordered beats while the hero pin scrubs (progress 0→1):
 * 1) Hero drifts + amber dissolve covers the stage completely
 * 2) Stage clears (still amber → privacy amber underneath)
 * 3) Privacy copy fades in
 * Then the privacy exit pin continues:
 * 4) Privacy copy holds at full opacity
 * 5) First feature card underlaps the pin and peeks into view
 * 6) Copy fades out in place; further cards scroll; section bg morphs amber → gem colors
 */
export const HERO_EXIT_SCRUB_SVH = 140

/** Sticky pin: large viewport + scrub for amber → clear → copy. */
export const HERO_PIN_HEIGHT = `calc(100lvh + ${HERO_EXIT_SCRUB_SVH}svh)`

/** Pull privacy intro under the full pin. */
export const INTRO_UNDER_HERO_MARGIN = `calc(-100lvh - ${HERO_EXIT_SCRUB_SVH}svh)`

export const HANDOFF = {
  /** Amber dissolve reaches full cover — hero is fully hidden. */
  amberEnd: 0.4,
  /** Stage clears only after amber is solid. */
  clearStart: 0.4,
  clearEnd: 0.55,
  /**
   * Privacy copy fades in as the stage finishes clearing.
   * Starts slightly before clearEnd so the block is readable sooner.
   */
  copyStart: 0.48,
  copyEnd: 0.86,
} as const

/**
 * Extra pin travel after the hero scrub. Equal to the features underlap so the
 * first card can sit in view while copy is still sticky.
 */
export const INTRO_HOLD_BEFORE_CARDS_SVH = 64

/** Pull the first card up under the privacy pin so it can enter before sticky release. */
export const INTRO_CARD_OVERLAP = `${INTRO_HOLD_BEFORE_CARDS_SVH}svh`

/**
 * Card-top as a fraction of viewport.
 * Fade finishes while the card is still in the lower third — before it reaches the title.
 */
export const COPY_EXIT_CARD = {
  startTop: 0.88,
  endTop: 0.64,
} as const

/**
 * Privacy sticky pin covers the underlapped hero scrub + hold so the stage
 * stays put from hero dissolve through copy fade-out.
 * (Sibling spacers below sticky release too early.)
 */
export const INTRO_EXIT_PIN_HEIGHT = `calc(100lvh + ${HERO_EXIT_SCRUB_SVH + INTRO_HOLD_BEFORE_CARDS_SVH}svh)`

/** Map value from [start, end] onto 0–1. `end < start` is valid (e.g. element top falling as you scroll). */
export function remap01(value: number, start: number, end: number) {
  const span = end - start
  if (span === 0) return value >= end ? 1 : 0
  return Math.min(1, Math.max(0, (value - start) / span))
}

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function smoothstep(t: number) {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}
