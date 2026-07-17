import type { ReactNode } from 'react'
import tooltipStyles from '@/components/Tooltip/Tooltip.module.css'
import styles from './AmountExceededWarning.module.css'

export interface AmountExceededWarningProps {
  id: string
  visible: boolean
  message: string
  children: ReactNode
}

/** Persistent action-style tooltip shown above an amount input when balance is exceeded. */
export function AmountExceededWarning({
  id,
  visible,
  message,
  children,
}: AmountExceededWarningProps) {
  return (
    <div className={styles.wrapper}>
      {visible ? (
        <div
          id={id}
          className={[tooltipStyles.tooltip, tooltipStyles.action, styles.tooltip].join(' ')}
          role="alert"
        >
          <p className={tooltipStyles.actionText}>{message}</p>
        </div>
      ) : null}
      {children}
    </div>
  )
}
