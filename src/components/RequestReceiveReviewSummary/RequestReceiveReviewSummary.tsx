import { ArmadaLogo } from '@/components/ArmadaLogo'
import {
  ReviewSummary,
  ReviewSummaryRow,
  ReviewSummaryTotalRow,
  ReviewSummaryValueWithIcon,
  reviewSummaryMarkIconClassName,
} from '@/components/ReviewSummary'
import { TransactionDateTimeRow } from '@/components/TransactionDateTimeRow'
import { formatUsdcAmount, truncateAddress } from '@/utils/format'
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import usdcAmount from '@/styles/usdcAmount.module.css'

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
    <ReviewSummary
      total={<ReviewSummaryTotalRow valueClassName={usdcAmount.font}>{totalLabel}</ReviewSummaryTotalRow>}
    >
      <TransactionDateTimeRow confirmedAt={confirmedAt} />
      <ReviewSummaryRow label="Via">Payment link</ReviewSummaryRow>
      <ReviewSummaryRow label="To your private account">
        <ReviewSummaryValueWithIcon>
          <ArmadaLogo variant="mark" markTone="deep" className={reviewSummaryMarkIconClassName} />
          <span>{truncateAddress(armadaAddress)}</span>
        </ReviewSummaryValueWithIcon>
      </ReviewSummaryRow>
      {note ? <ReviewSummaryRow label="Note">{note}</ReviewSummaryRow> : null}
      <ReviewSummaryRow label="Transaction">{truncateAddress(txHash)}</ReviewSummaryRow>
      <ReviewSummaryRow label="Fees" valueClassName={usdcAmount.font}>
        {feeLabel}
      </ReviewSummaryRow>
    </ReviewSummary>
  )
}
