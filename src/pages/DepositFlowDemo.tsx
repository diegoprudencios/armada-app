import { useState } from 'react'
import type { DepositChainId } from '@/constants/depositChains'
import { DepositModalFlow } from './DepositModalFlow'
import { DEPOSIT_WALLET_BALANCE } from './depositFlowConstants'

export function DepositFlowDemo() {
  const [step, setStep] = useState<'amount' | 'review' | 'wallet' | 'processing' | 'confirmed'>('amount')
  const [amount, setAmount] = useState('')
  const [chain, setChain] = useState<DepositChainId>('sepolia')
  const [confirmedAt, setConfirmedAt] = useState<number | null>(null)

  function reset() {
    setStep('amount')
    setAmount('')
    setChain('sepolia')
    setConfirmedAt(null)
  }

  return (
    <DepositModalFlow
      step={step}
      amount={amount}
      chain={chain}
      depositWalletBalance={Number(DEPOSIT_WALLET_BALANCE)}
      confirmedAt={confirmedAt}
      onClose={reset}
      onAmountChange={setAmount}
      onAmountReview={(nextAmount, nextChain) => {
        setAmount(nextAmount)
        setChain(nextChain)
        setStep('review')
      }}
      onReviewBack={() => setStep('amount')}
      onReviewConfirm={() => setStep('wallet')}
      onWalletComplete={() => setStep('processing')}
      onWalletCancel={() => setStep('review')}
      onProcessingComplete={() => {
        setConfirmedAt(Date.now())
        setStep('confirmed')
      }}
      onConfirmedGoToDashboard={reset}
    />
  )
}
