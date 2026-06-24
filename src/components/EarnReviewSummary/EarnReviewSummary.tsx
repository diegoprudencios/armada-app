import { formatUsdcAmount } from '@/utils/format'
import { formatDemoApy, type EarnTab } from '@/pages/earnFlowConstants'
import usdcAmount from '@/styles/usdcAmount.module.css'
import styles from './EarnReviewSummary.module.css'

export interface EarnReviewSummaryProps {
  tab: EarnTab
  amount: number
  apy: number
  feeUsdc: number
}

export function EarnReviewSummary({ tab, amount, apy, feeUsdc }: EarnReviewSummaryProps) {
  const modeLabel = tab === 'add' ? 'Add to vault' : 'Withdraw from vault'
  const amountRowLabel = tab === 'add' ? 'Your deposit' : 'Your withdrawal'
  const feeLabel = `${formatUsdcAmount(feeUsdc, 2)} USDC`
  const total = amount + feeUsdc
  const totalLabel = `${formatUsdcAmount(total, 2)} USDC`

  return (
    <div className={styles.summary}>
      <div className={styles.summaryBody}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Mode</span>
          <span className={styles.summaryValue}>{modeLabel}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Estimated APY</span>
          <span className={styles.summaryValue}>{formatDemoApy(apy)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{amountRowLabel}</span>
          <span className={[styles.summaryValue, usdcAmount.font].join(' ')}>
            {formatUsdcAmount(amount)} USDC
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Estimated fee</span>
          <span className={[styles.summaryValue, usdcAmount.font].join(' ')}>{feeLabel}</span>
        </div>
      </div>
      <div className={styles.summaryTotalRow}>
        <span className={styles.summaryTotalLabel}>Total</span>
        <span className={[styles.summaryTotalValue, usdcAmount.font].join(' ')}>{totalLabel}</span>
      </div>
    </div>
  )
}
