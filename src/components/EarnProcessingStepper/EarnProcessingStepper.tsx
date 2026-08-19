import { TxProcessingLayout, type TxProcessingLayoutVariant } from '@/components/TxProcessingLayout'
import { earnProcessingStages, earnProgressCardCopy } from '@/constants/txProcessingCopy'
import type { EarnTab } from '@/pages/earnFlowConstants'

export interface EarnProcessingStepperProps {
  tab: EarnTab
  activeStageIndex?: number
  completed?: boolean
  layout?: TxProcessingLayoutVariant
  className?: string
}

export function EarnProcessingStepper({
  tab,
  activeStageIndex = 0,
  completed = false,
  layout = 'default',
  className,
}: EarnProcessingStepperProps) {
  return (
    <TxProcessingLayout
      className={className}
      cardCopy={earnProgressCardCopy(tab)}
      stages={earnProcessingStages(tab)}
      activeStageIndex={activeStageIndex}
      completed={completed}
      layout={layout}
    />
  )
}
