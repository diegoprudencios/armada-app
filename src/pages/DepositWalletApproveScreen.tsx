import { useEffect, useState } from 'react'
import { modalStepBodyEnter } from '@/components/ModalShell'
import { WalletConfirmList, type WalletStep } from '@/components/WalletConfirmList'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import styles from './DepositWalletApproveScreen.module.css'

const APPROVE_DONE_MS = 2000
const SIGN_DONE_MS = 4000

export interface DepositWalletApproveScreenProps {
  amount: string
  onComplete: () => void
}

export function DepositWalletApproveScreen({
  amount,
  onComplete,
}: DepositWalletApproveScreenProps) {
  const amountLabel = formatUsdcAmount(parseActiveAmount(amount))
  const [steps, setSteps] = useState<WalletStep[]>([
    { label: `Approve ${amountLabel} USDC`, status: 'loading' },
    { label: 'Sign deposit transaction', status: 'pending' },
  ])

  useEffect(() => {
    let completeTimer = 0

    const approveTimer = window.setTimeout(() => {
      setSteps([
        { label: `Approve ${amountLabel} USDC`, status: 'done' },
        { label: 'Sign deposit transaction', status: 'loading' },
      ])
    }, APPROVE_DONE_MS)

    const signTimer = window.setTimeout(() => {
      setSteps([
        { label: `Approve ${amountLabel} USDC`, status: 'done' },
        { label: 'Sign deposit transaction', status: 'done' },
      ])
      completeTimer = window.setTimeout(onComplete, 400)
    }, SIGN_DONE_MS)

    return () => {
      window.clearTimeout(approveTimer)
      window.clearTimeout(signTimer)
      window.clearTimeout(completeTimer)
    }
  }, [amountLabel, onComplete])

  return (
    <div className={styles.column}>
      <div className={`${styles.body} ${modalStepBodyEnter}`}>
        <h1 className={styles.title}>
          Confirm transactions
          <br />
          on your wallet
        </h1>

        <WalletConfirmList steps={steps} />
      </div>

      <p className={styles.footerText} aria-live="polite" aria-atomic="true">
        Waiting for wallet confirmation
      </p>
    </div>
  )
}
