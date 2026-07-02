import { ArmadaLogo } from '@/components/ArmadaLogo'
import { TransactionDateTimeRow } from '@/components/TransactionDateTimeRow'
import { WalletProviderIcon } from '@/components/WalletPillMenu/WalletPillMenu'
import { formatUsdcAmount, truncateAddress } from '@/utils/format'
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import usdcAmount from '@/styles/usdcAmount.module.css'
import styles from './DepositReviewSummary.module.css'

const ROW_ICON_PX = 16

export interface DepositReviewSummaryProps {
  networkName: string
  amount: number
  feeUsdc: number
  walletAddress: string
  walletProvider?: string
  armadaAddress: string
  confirmedAt?: number
}

export function DepositReviewSummary({
  networkName,
  amount,
  feeUsdc,
  walletAddress,
  walletProvider = 'metamask',
  armadaAddress,
  confirmedAt,
}: DepositReviewSummaryProps) {
  const total = amount + feeUsdc
  const feeLabel = formatProtocolFeeLabel(feeUsdc)
  const totalLabel = `${formatUsdcAmount(total, 2)} USDC`

  return (
    <div className={styles.summary}>
      <div className={styles.summaryBody}>
        {confirmedAt ? <TransactionDateTimeRow confirmedAt={confirmedAt} /> : null}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Network</span>
          <span className={styles.summaryValue}>{networkName}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>From your wallet</span>
          <span className={styles.summaryValue}>
            <span className={styles.valueWithIcon}>
              <WalletProviderIcon provider={walletProvider} size={ROW_ICON_PX} />
              <span>{truncateAddress(walletAddress)}</span>
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
