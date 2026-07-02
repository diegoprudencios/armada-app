import { ArmadaLogo } from '@/components/ArmadaLogo'
import { TransactionDateTimeRow } from '@/components/TransactionDateTimeRow'
import { isArmadaAddress, sendNetworkDisplayName, type SendChainId } from '@/pages/sendFlowConstants'
import { formatUsdcAmount, truncateAddress } from '@/utils/format'
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import usdcAmount from '@/styles/usdcAmount.module.css'
import styles from '../DepositReviewSummary/DepositReviewSummary.module.css'

export interface ReceivePaymentReviewSummaryProps {
  amount: number
  sender: string
  chain: SendChainId
  armadaAddress: string
  txHash: string
  confirmedAt: number
}

export function ReceivePaymentReviewSummary({
  amount,
  sender,
  chain,
  armadaAddress,
  txHash,
  confirmedAt,
}: ReceivePaymentReviewSummaryProps) {
  const isPrivate = isArmadaAddress(sender)
  const networkName = isPrivate ? undefined : sendNetworkDisplayName(chain)
  const feeUsdc = 0
  const feeLabel = formatProtocolFeeLabel(feeUsdc)
  const totalLabel = `${formatUsdcAmount(amount, 2)} USDC`

  return (
    <div className={styles.summary}>
      <div className={styles.summaryBody}>
        <TransactionDateTimeRow confirmedAt={confirmedAt} />
        {!isPrivate && networkName ? (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Network</span>
            <span className={styles.summaryValue}>{networkName}</span>
          </div>
        ) : null}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>From</span>
          <span className={styles.summaryValue}>
            <span className={styles.valueWithIcon}>
              {isPrivate ? <ArmadaLogo variant="mark" className={styles.armadaIcon} /> : null}
              <span>{truncateAddress(sender)}</span>
            </span>
          </span>
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
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Privacy</span>
          <span className={styles.summaryValue}>{isPrivate ? 'Private' : 'Public'}</span>
        </div>
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
