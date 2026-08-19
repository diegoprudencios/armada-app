import { ReviewSummaryRow } from '@/components/ReviewSummary'
import { formatTransactionDateTime } from '@/utils/formatTransactionDateTime'

export interface TransactionDateTimeRowProps {
  confirmedAt: number
}

export function TransactionDateTimeRow({ confirmedAt }: TransactionDateTimeRowProps) {
  return (
    <ReviewSummaryRow label="Date and time">{formatTransactionDateTime(confirmedAt)}</ReviewSummaryRow>
  )
}
