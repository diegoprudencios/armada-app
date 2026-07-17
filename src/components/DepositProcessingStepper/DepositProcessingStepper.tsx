import { TxProcessingLayout, type TxProcessingLayoutVariant } from '@/components/TxProcessingLayout/TxProcessingLayout'
import {
  DEPOSIT_PROCESSING_STAGES,
  DEPOSIT_PROGRESS_CARD_COPY,
} from '@/constants/txProcessingCopy'
import type { TransactionProgressVariant } from '@/components/TransactionProgressDisclosure'

export interface DepositProcessingStepperProps {
  activeStageIndex?: number
  completed?: boolean
  progressVariant?: TransactionProgressVariant
  layout?: TxProcessingLayoutVariant
  className?: string
}

export function DepositProcessingStepper({
  activeStageIndex = 0,
  completed = false,
  progressVariant,
  layout,
  className,
}: DepositProcessingStepperProps) {
  return (
    <TxProcessingLayout
      className={className}
      cardCopy={DEPOSIT_PROGRESS_CARD_COPY}
      stages={DEPOSIT_PROCESSING_STAGES}
      activeStageIndex={activeStageIndex}
      completed={completed}
      progressVariant={progressVariant}
      layout={layout}
    />
  )
}
