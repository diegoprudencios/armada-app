import styles from './StatusChip.module.css'

export type StatusChipVariant = 'neutral' | 'success' | 'warning' | 'error'

export interface StatusChipProps {
  label: string
  variant?: StatusChipVariant
  showDot?: boolean
  className?: string
}

export function StatusChip({
  label,
  variant = 'neutral',
  showDot = true,
  className,
}: StatusChipProps) {
  const cls = [styles.chip, styles[variant], className].filter(Boolean).join(' ')
  return (
    <span className={cls} role="status">
      {showDot ? <span className={styles.dot} aria-hidden /> : null}
      <span className={styles.label}>{label}</span>
    </span>
  )
}
