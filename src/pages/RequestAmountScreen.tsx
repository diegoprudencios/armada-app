import type { Ref } from 'react'
import {
  AmountInputScreen,
  type AmountInputEntryMode,
} from '@/components/AmountInputScreen'
import { hasActiveAmount } from '@/utils/amountInput'

export interface RequestAmountScreenProps {
  amount: string
  /** Default `input` keeps the current system-keyboard UI. */
  entryMode?: AmountInputEntryMode
  amountInputRef?: Ref<HTMLInputElement>
  onAmountChange: (amount: string) => void
  onBack: () => void
  onContinue: (amount: string) => void
}

export function RequestAmountScreen({
  amount,
  entryMode = 'input',
  amountInputRef,
  onAmountChange,
  onBack,
  onContinue,
}: RequestAmountScreenProps) {
  return (
    <AmountInputScreen
      title="How much USDC?"
      balance={0}
      amount={amount}
      entryMode={entryMode}
      amountInputRef={amountInputRef}
      amountAriaLabel="Requested amount in USDC"
      exceedMessage=""
      showBalanceControls={false}
      primaryActionLabel={hasActiveAmount(amount) ? 'Continue' : 'Input amount'}
      calculateFee={() => 0}
      onAmountChange={onAmountChange}
      onReview={() => onContinue(amount)}
      secondaryAction={{ label: 'Back', onClick: onBack }}
    />
  )
}
