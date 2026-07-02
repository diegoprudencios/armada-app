import { Button } from '@/components/Button'
import {
  DepositAmountCard,
  type DepositChainId,
} from '@/components/DepositAmountCard'
import { hasActiveAmount, parseActiveAmount } from '@/utils/amountInput'
import { depositAmountExceedsBalance } from '@/utils/depositFee'
import flowStyles from '../DepositFlow.module.css'
import styles from './DepositStep1Amount.module.css'

export interface DepositStep1AmountProps {
  amount: string
  onAmountChange: (value: string) => void
  chain?: DepositChainId
  onChainChange?: (chain: DepositChainId) => void
  balance: string
  fee: string
  onMax: () => void
  onCancel: () => void
  onContinue: () => void
}

export function DepositStep1AmountContent({
  amount,
  onAmountChange,
  chain,
  onChainChange,
  balance,
  fee,
  onMax,
}: Pick<
  DepositStep1AmountProps,
  'amount' | 'onAmountChange' | 'chain' | 'onChainChange' | 'balance' | 'fee' | 'onMax'
>) {
  return (
    <div className={styles.contentZone}>
      <p className={styles.question}>How much USDC you want to deposit?</p>
      <DepositAmountCard
        chain={chain}
        onChainChange={onChainChange}
        amount={amount}
        onAmountChange={onAmountChange}
        balance={balance}
        fee={fee}
        onMax={onMax}
      />
    </div>
  )
}

export function DepositStep1AmountFooter({
  amount,
  balance,
  onCancel,
  onContinue,
}: Pick<DepositStep1AmountProps, 'amount' | 'balance' | 'onCancel' | 'onContinue'>) {
  const availableBalance = parseActiveAmount(balance.replace(/,/g, ''))
  const canContinue =
    hasActiveAmount(amount) && !depositAmountExceedsBalance(parseActiveAmount(amount), availableBalance)

  return (
    <div className={flowStyles.buttonRow}>
      <Button
        variant="secondary"
        size="lg"
        label="Cancel"
        showIcon={false}
        onClick={onCancel}
      />
      <Button
        variant="primary"
        size="lg"
        label="Review"
        showIcon={false}
        disabled={!canContinue}
        onClick={onContinue}
      />
    </div>
  )
}
