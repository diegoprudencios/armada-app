import styles from './WalletConfirmList.module.css'

export type WalletStepStatus = 'pending' | 'loading' | 'done'

export interface WalletStep {
  label: string
  status: WalletStepStatus
}

const STATUS_LABEL: Record<WalletStepStatus, string> = {
  loading: 'Loading',
  pending: 'Pending',
  done: 'Complete',
}

export interface WalletConfirmListProps {
  steps: WalletStep[]
}

export function WalletConfirmList({ steps }: WalletConfirmListProps) {
  return (
    <div
      className={styles.card}
      role="list"
      aria-live="polite"
      aria-label="Wallet confirmations"
    >
      {steps.map((step, index) => (
        <div key={step.label} role="listitem">
          {index > 0 ? <div className={styles.divider} aria-hidden="true" /> : null}
          <div className={styles.row}>
            <span className={styles.label}>{step.label}</span>
            <div className={styles.status} aria-label={STATUS_LABEL[step.status]}>
              {step.status === 'loading' ? (
                <div className={styles.spinner} role="status" aria-label="Loading" />
              ) : null}
              {step.status === 'pending' ? (
                <div className={styles.circle} aria-hidden="true" />
              ) : null}
              {step.status === 'done' ? (
                <div className={styles.check} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : null}
              <span className={styles.visuallyHidden}>{STATUS_LABEL[step.status]}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
