import { ArmadaLogo } from '@/components/ArmadaLogo'
import { TransactionDateTimeRow } from '@/components/TransactionDateTimeRow'
import { formatUsdcAmount, truncateAddress } from '@/utils/format'
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import usdcAmount from '@/styles/usdcAmount.module.css'
import styles from '../DepositReviewSummary/DepositReviewSummary.module.css'

export interface RequestReceiveReviewSummaryProps {
  amount: number
  armadaAddress: string
  txHash: string
  confirmedAt: number
  note?: string
}

export function RequestReceiveReviewSummary({
  amount,
  armadaAddress,
  txHash,
  confirmedAt,
  note,
}: RequestReceiveReviewSummaryProps) {
  const feeUsdc = 0
  const feeLabel = formatProtocolFeeLabel(feeUsdc)
  const totalLabel = `${formatUsdcAmount(amount, 2)} USDC`

  return (
    <div className={styles.summary}>
      <div className={styles.summaryBody}>
        <TransactionDateTimeRow confirmedAt={confirmedAt} />
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Via</span>
          <span className={styles.summaryValue}>Payment link</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>To your private account</span>
          <span className={styles.summaryValue}>
            <span className={styles.valueWithIcon}>
              <ArmadaLogo variant="mark" className={styles.armadaIcon} />
              <span>{truncateAddress(armadaAddress)}</span>
            </span>
          </span>
        </div>
        {note ? (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Note</span>
            <span className={styles.summaryValue}>{note}</span>
          </div>
        ) : null}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Transaction</span>
          <span className={styles.summaryValue}>{truncateAddress(txHash)}</span>
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
