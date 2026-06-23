/** Keep in sync with BalanceCard.module.css balance reveal keyframes. */
export const BALANCE_REVEAL_DELAY_MS = 1280
export const BALANCE_REVEAL_DURATION_MS = 920
export const BALANCE_REVEAL_SPLIT_AT = 0.42

/** Digit odometer roll — intentionally longer than the balance reveal split window. */
export const BALANCE_ROLL_DURATION_MS = 1000
export const BALANCE_ROLL_DIGIT_STAGGER_MS = 70

/** Action button enter — keep in sync with BalanceCard.module.css `.actionEnter`. */
export const BALANCE_ACTION_BUTTON_ENTER_MS = 520
export const BALANCE_DEPOSIT_BUTTON_ENTER_DELAY_MS = 630

/** Tooltip appears shortly after the deposit button finishes entering. */
export const DASHBOARD_TOOLTIP_ENTER_DELAY_MS =
  BALANCE_DEPOSIT_BUTTON_ENTER_DELAY_MS + BALANCE_ACTION_BUTTON_ENTER_MS + 180

export function balanceRevealRollStartMs(): number {
  return BALANCE_REVEAL_DELAY_MS + BALANCE_REVEAL_DURATION_MS * BALANCE_REVEAL_SPLIT_AT
}

export function balanceRevealRollDurationMs(): number {
  return BALANCE_ROLL_DURATION_MS
}
