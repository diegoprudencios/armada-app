import { ArmadaLogo } from '@/components/ArmadaLogo'
import { PrivacyNotice } from '@/components/PrivacyNotice'
import {
  ReviewSummary,
  ReviewSummaryRow,
  ReviewSummaryTotalRow,
  ReviewSummaryValueWithIcon,
  reviewSummaryMarkIconClassName,
  type ReviewSummaryTone,
} from '@/components/ReviewSummary'
import { TransactionDateTimeRow } from '@/components/TransactionDateTimeRow'
import { formatUsdcAmount, truncateAddress } from '@/utils/format'
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import { isArmadaAddress, sendPrivacyNotice, type SendFlowVariant } from '@/pages/sendFlowConstants'
import usdcAmount from '@/styles/usdcAmount.module.css'

export interface SendReviewSummaryProps {
  recipientAddress: string
  armadaAddress: string
  networkName?: string
  amount: number
  feeUsdc: number
  confirmedAt?: number
  variant?: SendFlowVariant
  /** Soft cool-gray fills for the summary table (e.g. white bottom sheet). */
  tone?: ReviewSummaryTone
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
  const privacyNotice = sendPrivacyNotice(isPrivate)
  const total = amount + feeUsdc
  const feeLabel = formatProtocolFeeLabel(feeUsdc)
  const totalLabel = `${formatUsdcAmount(total, 2)} USDC`

  return (
    <ReviewSummary
      tone={tone}
      total={<ReviewSummaryTotalRow valueClassName={usdcAmount.font}>{totalLabel}</ReviewSummaryTotalRow>}
      footer={
        !confirmedAt ? (
          <PrivacyNotice
            tone={isPrivate ? 'private' : 'public'}
            title={privacyNotice.title}
            body={privacyNotice.body}
          />
        ) : null
      }
    >
      {confirmedAt ? <TransactionDateTimeRow confirmedAt={confirmedAt} /> : null}
      {!isPrivate && networkName ? (
        <ReviewSummaryRow label="Network">{networkName}</ReviewSummaryRow>
      ) : null}
      <ReviewSummaryRow label="From your private account">
        <ReviewSummaryValueWithIcon>
          <ArmadaLogo variant="mark" markTone="deep" className={reviewSummaryMarkIconClassName} />
          <span>{truncateAddress(armadaAddress)}</span>
        </ReviewSummaryValueWithIcon>
      </ReviewSummaryRow>
      <ReviewSummaryRow label="To recipient">
        <ReviewSummaryValueWithIcon>
          {isPrivate ? (
            <ArmadaLogo variant="mark" markTone="deep" className={reviewSummaryMarkIconClassName} />
          ) : null}
          <span>{truncateAddress(recipientAddress)}</span>
        </ReviewSummaryValueWithIcon>
      </ReviewSummaryRow>
      <ReviewSummaryRow label="Fees" valueClassName={usdcAmount.font}>
        {feeLabel}
      </ReviewSummaryRow>
    </ReviewSummary>
  )
}
