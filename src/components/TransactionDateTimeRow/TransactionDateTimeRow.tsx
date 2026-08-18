import { formatTransactionDateTime } from '@/utils/formatTransactionDateTime'
import styles from '@/components/DepositReviewSummary/DepositReviewSummary.module.css'

export interface TransactionDateTimeRowProps {
  confirmedAt: number
}

export function TransactionDateTimeRow({ confirmedAt }: TransactionDateTimeRowProps) {
  return (
    <div className={styles.summaryRow}>
      <span className={styles.summaryLabel}>Date and time</span>
      <span className={styles.summaryValue}>{formatTransactionDateTime(confirmedAt)}</span>
    </div>
  )
}
