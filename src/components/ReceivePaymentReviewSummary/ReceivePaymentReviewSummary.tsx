import { ArmadaLogo } from '@/components/ArmadaLogo'
import {
  ReviewSummary,
  ReviewSummaryRow,
  ReviewSummaryTotalRow,
  ReviewSummaryValueWithIcon,
  reviewSummaryMarkIconClassName,
} from '@/components/ReviewSummary'
import { TransactionDateTimeRow } from '@/components/TransactionDateTimeRow'
import { isArmadaAddress, sendNetworkDisplayName, type SendChainId } from '@/pages/sendFlowConstants'
import { formatUsdcAmount, truncateAddress } from '@/utils/format'
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import usdcAmount from '@/styles/usdcAmount.module.css'

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
    <ReviewSummary
      total={<ReviewSummaryTotalRow valueClassName={usdcAmount.font}>{totalLabel}</ReviewSummaryTotalRow>}
    >
      <TransactionDateTimeRow confirmedAt={confirmedAt} />
      {!isPrivate && networkName ? (
        <ReviewSummaryRow label="Network">{networkName}</ReviewSummaryRow>
      ) : null}
      <ReviewSummaryRow label="From">
        <ReviewSummaryValueWithIcon>
          {isPrivate ? (
            <ArmadaLogo variant="mark" markTone="deep" className={reviewSummaryMarkIconClassName} />
          ) : null}
          <span>{truncateAddress(sender)}</span>
        </ReviewSummaryValueWithIcon>
      </ReviewSummaryRow>
      <ReviewSummaryRow label="To your private account">
        <ReviewSummaryValueWithIcon>
          <ArmadaLogo variant="mark" markTone="deep" className={reviewSummaryMarkIconClassName} />
          <span>{truncateAddress(armadaAddress)}</span>
        </ReviewSummaryValueWithIcon>
      </ReviewSummaryRow>
      <ReviewSummaryRow label="Transaction">{truncateAddress(txHash)}</ReviewSummaryRow>
      <ReviewSummaryRow label="Fees" valueClassName={usdcAmount.font}>
        {feeLabel}
      </ReviewSummaryRow>
    </ReviewSummary>
  )
}
