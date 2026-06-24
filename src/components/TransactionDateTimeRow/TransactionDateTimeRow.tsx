import { formatTransactionDateTime } from '@/utils/formatTransactionDateTime'
import summary from '@/styles/summaryTable.module.css'

export interface TransactionDateTimeRowProps {
  confirmedAt: number
}

export function TransactionDateTimeRow({ confirmedAt }: TransactionDateTimeRowProps) {
  return (
    <div className={summary.row}>
      <span className={summary.label}>Date and time</span>
      <span className={summary.value}>{formatTransactionDateTime(confirmedAt)}</span>
    </div>
  )
}
