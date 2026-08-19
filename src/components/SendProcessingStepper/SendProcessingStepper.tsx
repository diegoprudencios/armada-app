import {
  TxProcessingLayout,
  type TxProcessingLayoutVariant,
} from '@/components/TxProcessingLayout'
import { sendProcessingStages, sendProgressCardCopy } from '@/constants/txProcessingCopy'
import { sendProcessingCopyMode, type SendFlowVariant } from '@/pages/sendFlowConstants'

export interface SendProcessingStepperProps {
  activeStageIndex?: number
  completed?: boolean
  variant?: SendFlowVariant
  recipient?: string
  layout?: TxProcessingLayoutVariant
  className?: string
}

export function SendProcessingStepper({
  activeStageIndex = 0,
  completed = false,
  variant = 'send',
  recipient,
  layout,
  className,
}: SendProcessingStepperProps) {
  const copyMode = sendProcessingCopyMode(variant, recipient)

  return (
    <TxProcessingLayout
      className={className}
      cardCopy={sendProgressCardCopy(copyMode)}
      stages={sendProcessingStages(copyMode)}
      activeStageIndex={activeStageIndex}
      completed={completed}
      layout={layout}
    />
  )
}
