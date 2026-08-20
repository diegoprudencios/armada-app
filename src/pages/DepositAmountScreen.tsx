import type { Ref } from 'react'
import type { DepositChainId } from '@/constants/depositChains'
import {
  AmountInputScreen,
  type AmountInputEntryMode,
  type ShieldDirection,
} from '@/components/AmountInputScreen'
import { AMOUNT_EXCEEDS_BALANCE_MESSAGE, DEPOSIT_EXCEEDS_BALANCE_MESSAGE } from '@/utils/amountFieldA11y'
import { calculateDepositFee } from '@/utils/depositFee'
import { calculateSendFee } from '@/utils/sendFee'

export interface DepositAmountScreenProps {
  balance: number
  amount: string
  chain?: DepositChainId
  direction?: ShieldDirection
  onDirectionChange?: (direction: ShieldDirection) => void
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
  direction = 'shield',
  onDirectionChange,
  entryMode = 'input',
  amountInputRef,
  onAmountChange,
  onCancel,
  onReview,
}: DepositAmountScreenProps) {
  const isUnshield = direction === 'unshield'

  return (
    <AmountInputScreen
      title={isUnshield ? 'Unshield your USDC' : 'Shield your USDC'}
      layout="shield"
      shieldDirection={direction}
      onShieldDirectionChange={onDirectionChange}
      primaryLabelMode="static"
      primaryActionLabel="Review"
      balance={balance}
      amount={amount}
      entryMode={entryMode}
      amountInputRef={amountInputRef}
      amountAriaLabel={isUnshield ? 'Unshield amount' : 'Shield amount'}
      exceedMessage={isUnshield ? AMOUNT_EXCEEDS_BALANCE_MESSAGE : DEPOSIT_EXCEEDS_BALANCE_MESSAGE}
      balanceMode={isUnshield ? 'simple' : 'deposit-fee-aware'}
      calculateFee={isUnshield ? calculateSendFee : calculateDepositFee}
      onAmountChange={onAmountChange}
      onReview={() => onReview(amount, chain)}
      secondaryAction={{ label: 'Cancel', onClick: onCancel }}
    />
  )
}
