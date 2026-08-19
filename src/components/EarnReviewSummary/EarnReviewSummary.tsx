import { TransactionDateTimeRow } from '@/components/TransactionDateTimeRow'
import {
  ReviewSummary,
  ReviewSummaryRow,
  ReviewSummaryTotalRow,
  type ReviewSummaryTone,
} from '@/components/ReviewSummary'
import { formatUsdcAmount } from '@/utils/format'
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import { formatDemoApy, type EarnTab } from '@/pages/earnFlowConstants'
import usdcAmount from '@/styles/usdcAmount.module.css'

export interface EarnReviewSummaryProps {
  tab: EarnTab
  amount: number
  apy: number
  feeUsdc: number
  confirmedAt?: number
  /** Soft cool-gray fills for the summary table (e.g. white bottom sheet). */
  tone?: ReviewSummaryTone
}

export function EarnReviewSummary({
  tab,
  amount,
  apy,
  feeUsdc,
  confirmedAt,
  tone = 'default',
}: EarnReviewSummaryProps) {
  const modeLabel = tab === 'add' ? 'Add to vault' : 'Withdraw from vault'
  const amountRowLabel = tab === 'add' ? 'Your deposit' : 'Your withdrawal'
  const feeLabel = formatProtocolFeeLabel(feeUsdc)
  const total = amount + feeUsdc
  const totalLabel = `${formatUsdcAmount(total, 2)} USDC`

  return (
    <ReviewSummary
      tone={tone}
      total={<ReviewSummaryTotalRow valueClassName={usdcAmount.font}>{totalLabel}</ReviewSummaryTotalRow>}
    >
      {confirmedAt ? <TransactionDateTimeRow confirmedAt={confirmedAt} /> : null}
      <ReviewSummaryRow label="Mode">{modeLabel}</ReviewSummaryRow>
      <ReviewSummaryRow label="Estimated APY">{formatDemoApy(apy)}</ReviewSummaryRow>
      <ReviewSummaryRow label={amountRowLabel} valueClassName={usdcAmount.font}>
        {formatUsdcAmount(amount)} USDC
      </ReviewSummaryRow>
      <ReviewSummaryRow label="Estimated fee" valueClassName={usdcAmount.font}>
        {feeLabel}
      </ReviewSummaryRow>
    </ReviewSummary>
  )
}
