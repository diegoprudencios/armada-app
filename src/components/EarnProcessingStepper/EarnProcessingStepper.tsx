import { TxProcessingLayout } from '@/components/TxProcessingLayout'
import type { TransactionProgressVariant } from '@/components/TransactionProgressDisclosure'
import { earnProcessingStages, earnProgressCardCopy } from '@/constants/txProcessingCopy'
import type { EarnTab } from '@/pages/earnFlowConstants'

export interface EarnProcessingStepperProps {
  tab: EarnTab
  activeStageIndex?: number
  completed?: boolean
  progressVariant?: TransactionProgressVariant
  className?: string
}

export function EarnProcessingStepper({
  tab,
  activeStageIndex = 0,
  completed = false,
  progressVariant,
  className,
}: EarnProcessingStepperProps) {
  return (
    <TxProcessingLayout
      className={className}
      cardCopy={earnProgressCardCopy(tab)}
      stages={earnProcessingStages(tab)}
      activeStageIndex={activeStageIndex}
      completed={completed}
      progressVariant={progressVariant}
    />
  )
}
