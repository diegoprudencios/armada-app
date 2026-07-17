import type { Ref } from 'react'
import type { DepositChainId } from '@/constants/depositChains'
import {
  AmountInputScreen,
  type AmountInputEntryMode,
} from '@/components/AmountInputScreen'
import { calculateDepositFee } from '@/utils/depositFee'
import { DEPOSIT_EXCEEDS_BALANCE_MESSAGE } from '@/utils/amountFieldA11y'

export interface DepositAmountScreenProps {
  balance: number
  amount: string
  chain?: DepositChainId
  /** Default `input` keeps the current system-keyboard UI. */
  entryMode?: AmountInputEntryMode
  amountInputRef?: Ref<HTMLInputElement>
  onAmountChange: (amount: string) => void
  onCancel: () => void
  onReview: (amount: string, chain: DepositChainId) => void
}

export function DepositAmountScreen({
  balance,
  amount,
  chain = 'sepolia',
  entryMode = 'input',
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
      entryMode={entryMode}
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
