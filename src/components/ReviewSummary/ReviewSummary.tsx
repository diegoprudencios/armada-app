import type { ReactNode } from 'react'
import styles from './ReviewSummary.module.css'

export type ReviewSummaryTone = 'default' | 'neutral'

export function ReviewSummary({
  tone = 'default',
  children,
  total,
  footer,
}: {
  tone?: ReviewSummaryTone
  children: ReactNode
  total: ReactNode
  footer?: ReactNode
}) {
  const summaryClassName = [styles.summary, tone === 'neutral' && styles.summaryNeutral]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={summaryClassName}>
      <div className={styles.body}>{children}</div>
      {total}
      {footer}
    </div>
  )
}

export function ReviewSummaryRow({
  label,
  children,
  valueClassName,
}: {
  label: string
  children: ReactNode
  valueClassName?: string
}) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={[styles.value, valueClassName].filter(Boolean).join(' ')}>{children}</span>
    </div>
  )
}

export function ReviewSummaryTotalRow({
  children,
  valueClassName,
}: {
  children: ReactNode
  valueClassName?: string
}) {
  return (
    <div className={styles.totalRow}>
      <span className={styles.totalLabel}>Total</span>
      <span className={[styles.totalValue, valueClassName].filter(Boolean).join(' ')}>{children}</span>
    </div>
  )
}

export function ReviewSummaryValueWithIcon({ children }: { children: ReactNode }) {
  return <span className={styles.valueWithIcon}>{children}</span>
}

export const reviewSummaryMarkIconClassName = styles.markIcon
