import { ArmadaLogo } from '@/components/ArmadaLogo'
import { TransactionDateTimeRow } from '@/components/TransactionDateTimeRow'
import { formatUsdcAmount, truncateAddress } from '@/utils/format'
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import { isArmadaAddress } from '@/pages/sendFlowConstants'
import usdcAmount from '@/styles/usdcAmount.module.css'
import styles from './SendReviewSummary.module.css'

export interface SendReviewSummaryProps {
  recipientAddress: string
  armadaAddress: string
  networkName?: string
  amount: number
  feeUsdc: number
  confirmedAt?: number
  /** Soft cool-gray fills for the summary table (e.g. white bottom sheet). */
  tone?: 'default' | 'neutral'
}

export function SendReviewSummary({
  recipientAddress,
  armadaAddress,
  networkName,
  amount,
  feeUsdc,
  confirmedAt,
  tone = 'default',
}: SendReviewSummaryProps) {
  const isPrivate = isArmadaAddress(recipientAddress)
  const total = amount + feeUsdc
  const amountLabel = `${formatUsdcAmount(amount, 2)} USDC`
  const feeLabel = formatProtocolFeeLabel(feeUsdc)
  const totalLabel = `${formatUsdcAmount(total, 2)} USDC`
  const summaryClassName = [styles.summary, tone === 'neutral' && styles.summaryNeutral]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={summaryClassName}>
      <div className={styles.summaryBody}>
        {confirmedAt ? <TransactionDateTimeRow confirmedAt={confirmedAt} /> : null}
        {!isPrivate && networkName ? (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Network</span>
            <span className={styles.summaryValue}>{networkName}</span>
          </div>
        ) : null}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>From your private account</span>
          <span className={styles.summaryValue}>
            <span className={styles.valueWithIcon}>
              <ArmadaLogo variant="mark" className={styles.armadaIcon} />
              <span>{truncateAddress(armadaAddress)}</span>
            </span>
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>To recipient</span>
          <span className={styles.summaryValue}>
            <span className={styles.valueWithIcon}>
              {isPrivate ? (
                <ArmadaLogo variant="mark" className={styles.armadaIcon} />
              ) : null}
              <span>{truncateAddress(recipientAddress)}</span>
            </span>
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Send amount</span>
          <span className={[styles.summaryValue, usdcAmount.font].join(' ')}>{amountLabel}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Privacy</span>
          <span className={styles.summaryValue}>{isPrivate ? 'Private' : 'Public'}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Fees</span>
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
