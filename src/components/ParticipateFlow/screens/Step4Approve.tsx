import { useEffect, useState } from 'react'
import styles from './Step4Approve.module.css'
import { Steps } from '@/components/Steps'
import { WalletConfirmList, type WalletStep } from '@/components/WalletConfirmList'
import type { ParticipateStepBarProps } from '@/components/ParticipateFlow/participateFlowSteps'

interface Step4ApproveProps extends ParticipateStepBarProps {
  onDone: () => void
  amount?: number
}

const DEFAULT_STEPS = ['Connect', 'Commit', 'Review', 'Confirmation']

export default function Step4Approve({
  onDone,
  amount = 1000,
  steps = DEFAULT_STEPS,
  stepIndex = 4,
}: Step4ApproveProps) {
  const amountLabel = amount.toLocaleString()
  const [txs, setTxs] = useState<WalletStep[]>([
    { label: `Approve ${amountLabel} USDC`, status: 'loading' },
    { label: 'Commit participation', status: 'pending' },
  ])

  useEffect(() => {
    const t1 = window.setTimeout(() => {
      setTxs([
        { label: `Approve ${amountLabel} USDC`, status: 'done' },
        { label: 'Commit participation', status: 'loading' },
      ])
    }, 2000)
    const t2 = window.setTimeout(() => {
      setTxs([
        { label: `Approve ${amountLabel} USDC`, status: 'done' },
        { label: 'Commit participation', status: 'done' },
      ])
      window.setTimeout(onDone, 400)
    }, 4000)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [amountLabel, onDone])

  return (
    <div className={styles.shell} data-flow-shell>
      <Steps steps={[...steps]} currentStep={stepIndex} />

      <div className={styles.content}>
        <h2 className={styles.title}>
          Confirm transactions<br />on your wallet
        </h2>

        <WalletConfirmList steps={txs} />
      </div>

      <div className={styles.footer}>
        <p
          className={styles.footerText}
          aria-live="polite"
          aria-atomic="true"
        >
          Waiting for wallet confirmation
        </p>
      </div>
    </div>
  )
}
