import type { TransactionProgressVariantProps } from './transactionProgressUtils'
import { TimelineVariant } from './variants/TimelineVariant'

export type TransactionProgressDisclosureProps = TransactionProgressVariantProps

export function TransactionProgressDisclosure(props: TransactionProgressDisclosureProps) {
  return <TimelineVariant {...props} />
}
