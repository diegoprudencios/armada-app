import { ArrowRightIcon } from '@heroicons/react/24/outline'
import styles from './SendButton.module.css'

export type SendButtonVariant = 'gradient' | 'solid'

export interface SendButtonProps {
  variant: SendButtonVariant
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function SendButton({
  variant,
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
      <span className={styles.label}>SEND</span>
      <span className={styles.icon} aria-hidden>
        <ArrowRightIcon className={styles.arrowIcon} strokeWidth={1.5} />
      </span>
    </button>
  )
}
