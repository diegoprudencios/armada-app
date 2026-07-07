import type { TxProgressStage } from '@/constants/txProcessingCopy'
import { resolveStageLabel } from '@/constants/txProcessingCopy'

export type RowKind = 'done' | 'currentActive' | 'pending' | 'completedFinal'

export function rowKindFor(index: number, activeIndex: number, completed = false): RowKind {
  if (completed) {
    if (index < activeIndex) return 'done'
    if (index === activeIndex) return 'completedFinal'
    return 'pending'
  }

  if (index < activeIndex) return 'done'
  if (index === activeIndex) return 'currentActive'
  return 'pending'
}

export interface TransactionProgressVariantProps {
  stages: ReadonlyArray<TxProgressStage>
  activeStageIndex?: number
  completed?: boolean
  className?: string
}

export function stageLabelFor(
  stage: TxProgressStage,
  index: number,
  stages: ReadonlyArray<TxProgressStage>,
  completed: boolean,
): string {
  return resolveStageLabel(stage, index, stages.length, completed)
}
