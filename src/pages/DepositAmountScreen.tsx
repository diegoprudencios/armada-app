import type { Ref } from 'react'
import type { DepositChainId } from '@/constants/depositChains'
import { AmountInputScreen } from '@/components/AmountInputScreen'
import { calculateDepositFee } from '@/utils/depositFee'
import { DEPOSIT_EXCEEDS_BALANCE_MESSAGE } from '@/utils/amountFieldA11y'

export interface DepositAmountScreenProps {
  balance: number
  amount: string
  chain?: DepositChainId
  amountInputRef?: Ref<HTMLInputElement>
  onAmountChange: (amount: string) => void
  onCancel: () => void
  onReview: (amount: string, chain: DepositChainId) => void
}

export function DepositAmountScreen({
  balance,
  amount,
  chain = 'sepolia',
  amountInputRef,
  onAmountChange,
  onCancel,
  onReview,
}: DepositAmountScreenProps) {
  return (
    <AmountInputScreen
      title="How much do you want to deposit?"
      balance={balance}
      amount={amount}
      amountInputRef={amountInputRef}
      amountAriaLabel="Deposit amount"
      exceedMessage={DEPOSIT_EXCEEDS_BALANCE_MESSAGE}
      balanceMode="deposit-fee-aware"
      calculateFee={calculateDepositFee}
      onAmountChange={onAmountChange}
      onReview={() => onReview(amount, chain)}
      secondaryAction={{ label: 'Cancel', onClick: onCancel }}
    />
  )
}
