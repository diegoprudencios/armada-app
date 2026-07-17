export const TX_PROCESSING_STAGE_ADVANCE_MS = 2500
export const TX_PROCESSING_COMPLETED_HOLD_MS = 2000

/** Keypad mobile deposit processing: ~15s total (3×4.5s stages + 1.5s completed hold). */
export const DEPOSIT_PROCESSING_STAGE_ADVANCE_MS = 4500
export const DEPOSIT_PROCESSING_COMPLETED_HOLD_MS = 1500

export interface TxProcessingDemoCallbacks {
  onStageChange: (index: number) => void
  onCompleted: () => void
  onComplete: () => void
}

export interface TxProcessingDemoTiming {
  stageAdvanceMs?: number
  completedHoldMs?: number
}

/** Demo timing for modal processing screens: stages advance, then a brief completed beat. */
export function scheduleTxProcessingDemo(
  callbacks: TxProcessingDemoCallbacks,
  timing: TxProcessingDemoTiming = {},
): () => void {
  const stageAdvanceMs = timing.stageAdvanceMs ?? TX_PROCESSING_STAGE_ADVANCE_MS
  const completedHoldMs = timing.completedHoldMs ?? TX_PROCESSING_COMPLETED_HOLD_MS
  const completedAt = stageAdvanceMs * 3

  const stageTimers = [
    window.setTimeout(() => callbacks.onStageChange(1), stageAdvanceMs),
    window.setTimeout(() => callbacks.onStageChange(2), stageAdvanceMs * 2),
    window.setTimeout(() => callbacks.onCompleted(), completedAt),
    window.setTimeout(callbacks.onComplete, completedAt + completedHoldMs),
  ]

  return () => {
    stageTimers.forEach(window.clearTimeout)
  }
}
