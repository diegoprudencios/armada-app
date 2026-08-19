import { ArmadaLogo } from '@/components/ArmadaLogo'
import {
  ReviewSummary,
  ReviewSummaryRow,
  ReviewSummaryTotalRow,
  ReviewSummaryValueWithIcon,
  reviewSummaryMarkIconClassName,
  type ReviewSummaryTone,
} from '@/components/ReviewSummary'
import { TransactionDateTimeRow } from '@/components/TransactionDateTimeRow'
import { WalletProviderIcon } from '@/components/WalletPillMenu/WalletPillMenu'
import { formatUsdcAmount, truncateAddress, truncateArmadaAddress } from '@/utils/format'
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import usdcAmount from '@/styles/usdcAmount.module.css'

const ROW_ICON_PX = 16

export interface DepositReviewSummaryProps {
  networkName: string
  amount: number
  feeUsdc: number
  walletAddress: string
  walletProvider?: string
  armadaAddress: string
  confirmedAt?: number
  /** Soft cool-gray fills for the summary table (e.g. white bottom sheet). */
  tone?: ReviewSummaryTone
}

export function DepositReviewSummary({
  networkName,
  amount,
  feeUsdc,
  walletAddress,
  walletProvider = 'metamask',
  armadaAddress,
  confirmedAt,
  tone = 'default',
}: DepositReviewSummaryProps) {
  const total = amount + feeUsdc
  const feeLabel = formatProtocolFeeLabel(feeUsdc)
  const totalLabel = `${formatUsdcAmount(total, 2)} USDC`

  return (
    <ReviewSummary
      tone={tone}
      total={<ReviewSummaryTotalRow valueClassName={usdcAmount.font}>{totalLabel}</ReviewSummaryTotalRow>}
    >
      {confirmedAt ? <TransactionDateTimeRow confirmedAt={confirmedAt} /> : null}
      <ReviewSummaryRow label="Network">{networkName}</ReviewSummaryRow>
      <ReviewSummaryRow label="From your wallet">
        <ReviewSummaryValueWithIcon>
          <WalletProviderIcon provider={walletProvider} size={ROW_ICON_PX} />
          <span>{truncateAddress(walletAddress)}</span>
        </ReviewSummaryValueWithIcon>
      </ReviewSummaryRow>
      <ReviewSummaryRow label="To Armada">
        <ReviewSummaryValueWithIcon>
          <ArmadaLogo variant="mark" markTone="deep" className={reviewSummaryMarkIconClassName} />
          <span>{truncateArmadaAddress(armadaAddress)}</span>
        </ReviewSummaryValueWithIcon>
      </ReviewSummaryRow>
      <ReviewSummaryRow label="Fees" valueClassName={usdcAmount.font}>
        {feeLabel}
      </ReviewSummaryRow>
    </ReviewSummary>
  )
}
