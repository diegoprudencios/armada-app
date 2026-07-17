import type { Ref } from 'react'
import {
  AmountInputScreen,
  type AmountInputEntryMode,
} from '@/components/AmountInputScreen'
import { AMOUNT_EXCEEDS_BALANCE_MESSAGE } from '@/utils/amountFieldA11y'
import { calculateSendFee } from '@/utils/sendFee'

export interface SendAmountScreenProps {
  balance: number
  amount: string
  /** Default `input` keeps the current system-keyboard UI. */
  entryMode?: AmountInputEntryMode
  amountInputRef?: Ref<HTMLInputElement>
  onAmountChange: (amount: string) => void
  onBack: () => void
  onReview: (amount: string) => void
}

export function SendAmountScreen({
  balance,
  amount,
  entryMode = 'input',
  amountInputRef,
  onAmountChange,
  onBack,
  onReview,
}: SendAmountScreenProps) {
  return (
    <AmountInputScreen
      title="How much USDC?"
      balance={balance}
      amount={amount}
      entryMode={entryMode}
      amountInputRef={amountInputRef}
      amountAriaLabel="Send amount"
      exceedMessage={AMOUNT_EXCEEDS_BALANCE_MESSAGE}
      calculateFee={calculateSendFee}
      onAmountChange={onAmountChange}
      onReview={() => onReview(amount)}
      secondaryAction={{ label: 'Back', onClick: onBack }}
    />
  )
}
