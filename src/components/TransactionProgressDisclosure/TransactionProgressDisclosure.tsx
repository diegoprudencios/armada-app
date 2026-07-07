import type { TransactionProgressVariantProps } from './transactionProgressUtils'
import { InsetVariant } from './variants/InsetVariant'
import { SegmentsVariant } from './variants/SegmentsVariant'
import { TimelineVariant } from './variants/TimelineVariant'

export type TransactionProgressVariant = 'timeline' | 'segments' | 'inset'

export const TRANSACTION_PROGRESS_VARIANTS: ReadonlyArray<{
  id: TransactionProgressVariant
  label: string
  description: string
}> = [
  {
    id: 'timeline',
    label: 'Timeline',
    description: 'Animated lavender pill on a vertical track per step',
  },
  {
    id: 'segments',
    label: 'Segments',
    description: 'Horizontal progress segments with status icons',
  },
  {
    id: 'inset',
    label: 'Inset',
    description: 'Accent border collapsed; stacked inset rows expanded',
  },
]

export interface TransactionProgressDisclosureProps extends TransactionProgressVariantProps {
  variant?: TransactionProgressVariant
}

export function TransactionProgressDisclosure({
  variant = 'timeline',
  ...props
}: TransactionProgressDisclosureProps) {
  switch (variant) {
    case 'segments':
      return <SegmentsVariant {...props} />
    case 'inset':
      return <InsetVariant {...props} />
    case 'timeline':
    default:
      return <TimelineVariant {...props} />
  }
}
