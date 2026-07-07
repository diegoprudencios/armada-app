export const TX_PROCESSING_STAGE_ADVANCE_MS = 2500
export const TX_PROCESSING_COMPLETED_HOLD_MS = 2000

export interface TxProcessingDemoCallbacks {
  onStageChange: (index: number) => void
  onCompleted: () => void
  onComplete: () => void
}

/** Demo timing for modal processing screens: stages advance, then a brief completed beat. */
export function scheduleTxProcessingDemo(callbacks: TxProcessingDemoCallbacks): () => void {
  const completedAt = TX_PROCESSING_STAGE_ADVANCE_MS * 3

  const stageTimers = [
    window.setTimeout(() => callbacks.onStageChange(1), TX_PROCESSING_STAGE_ADVANCE_MS),
    window.setTimeout(() => callbacks.onStageChange(2), TX_PROCESSING_STAGE_ADVANCE_MS * 2),
    window.setTimeout(() => callbacks.onCompleted(), completedAt),
    window.setTimeout(
      callbacks.onComplete,
      completedAt + TX_PROCESSING_COMPLETED_HOLD_MS,
    ),
  ]

  return () => {
    stageTimers.forEach(window.clearTimeout)
  }
}
