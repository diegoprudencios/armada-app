import { AmountInputScreen } from '@/components/AmountInputScreen'
import { AMOUNT_EXCEEDS_BALANCE_MESSAGE } from '@/utils/amountFieldA11y'
import { calculateSendFee } from '@/utils/sendFee'

export interface SendAmountScreenProps {
  balance: number
  amount: string
  onAmountChange: (amount: string) => void
  onBack: () => void
  onReview: (amount: string) => void
}

export function SendAmountScreen({
  balance,
  amount,
  onAmountChange,
  onBack,
  onReview,
}: SendAmountScreenProps) {
  return (
    <AmountInputScreen
      title="How much USDC?"
      balance={balance}
      amount={amount}
      amountAriaLabel="Send amount"
      exceedMessage={AMOUNT_EXCEEDS_BALANCE_MESSAGE}
      calculateFee={calculateSendFee}
      onAmountChange={onAmountChange}
      onReview={() => onReview(amount)}
      secondaryAction={{ label: 'Back', onClick: onBack }}
    />
  )
}
