import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'
import styles from './SendButton.module.css'

export type SendButtonVariant = 'gradient' | 'solid' | 'lavender'

export interface SendButtonProps {
  variant: SendButtonVariant
  label?: string
  icon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function SendButton({
  variant,
  label = 'SEND',
  icon,
  onClick,
  disabled = false,
  className,
}: SendButtonProps) {
  const classNames = [styles.button, styles[variant], className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.icon} aria-hidden>
        {icon ?? <ArrowRightIcon className={styles.arrowIcon} strokeWidth={1.5} />}
      </span>
    </button>
  )
}
