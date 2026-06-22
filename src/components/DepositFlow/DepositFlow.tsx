import { useState } from 'react'
import { Steps } from '@/components/Steps'
import type { DepositChainId } from '@/components/DepositAmountCard'
import {
  DepositStep1AmountContent,
  DepositStep1AmountFooter,
} from '@/components/DepositFlow/steps/DepositStep1Amount'
import {
  DepositStep2ReviewContent,
  DepositStep2ReviewFooter,
} from '@/components/DepositFlow/steps/DepositStep2Review'
import { DepositStep3Processing } from '@/components/DepositFlow/steps/DepositStep3Processing'
import styles from './DepositFlow.module.css'

/** Five segments in the progress bar (Amount → Review → Wallet → Confirm → Complete). */
const DEPOSIT_PROGRESS_STEPS = ['Amount', 'Review', 'Wallet', 'Confirm', 'Complete'] as const
const BALANCE = '1235.1542'
const FEE = '0.00'
const CHAIN_LABEL = 'Sepolia'

export interface DepositFlowProps {
  onClose: () => void
  /** Initial amount string for demos (e.g. "1000"). */
  initialAmount?: string
}

export function DepositFlow({ onClose, initialAmount = '1000' }: DepositFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [amount, setAmount] = useState(initialAmount)
  const [chain, setChain] = useState<DepositChainId>('sepolia')

  function handleMax() {
    setAmount(BALANCE)
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Deposit">
      <div className={styles.column}>
        <Steps
          flowLabel="Deposit"
          steps={[...DEPOSIT_PROGRESS_STEPS]}
          currentStep={step}
          status="default"
        />

        {step === 1 ? (
          <DepositStep1AmountContent
            amount={amount}
            onAmountChange={setAmount}
            chain={chain}
            onChainChange={setChain}
            balance={BALANCE}
            fee={FEE}
            onMax={handleMax}
          />
        ) : null}

        {step === 2 ? (
          <DepositStep2ReviewContent amount={amount} chain={CHAIN_LABEL} />
        ) : null}

        {step === 3 ? <DepositStep3Processing onCancel={onClose} /> : null}

        {step === 1 ? (
          <DepositStep1AmountFooter
            amount={amount}
            onCancel={onClose}
            onContinue={() => setStep(2)}
          />
        ) : null}

        {step === 2 ? (
          <DepositStep2ReviewFooter
            onBack={() => setStep(1)}
            onConfirm={() => setStep(3)}
          />
        ) : null}
      </div>
    </div>
  )
}
