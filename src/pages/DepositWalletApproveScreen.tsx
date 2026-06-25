import { useEffect, useRef, useState } from 'react'
import { MockMetaMaskPopup } from '@/components/MockMetaMaskPopup'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { WalletConfirmList, type WalletStep } from '@/components/WalletConfirmList'
import { parseActiveAmount } from '@/utils/amountInput'
import { calculateDepositFee } from '@/utils/depositFee'
import { formatUsdcAmount } from '@/utils/format'
import styles from './DepositWalletApproveScreen.module.css'

const POPUP_OPEN_MS = 400
const COMPLETE_DELAY_MS = 400

type WalletPromptPhase = 'waiting' | 'approve' | 'sign' | 'closed'

export interface DepositWalletApproveScreenProps {
  amount: string
  networkName?: string
  walletAddress?: string
  signStepLabel?: string
  onComplete: () => void
  onCancel: () => void
}

export function DepositWalletApproveScreen({
  amount,
  networkName,
  walletAddress,
  signStepLabel = 'Sign deposit transaction',
  onComplete,
  onCancel,
}: DepositWalletApproveScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const totalUsdc = amountNum + calculateDepositFee(amountNum)
  const amountLabel = formatUsdcAmount(totalUsdc)
  const completeTimerRef = useRef(0)

  const [promptPhase, setPromptPhase] = useState<WalletPromptPhase>('waiting')
  const [steps, setSteps] = useState<WalletStep[]>([
    { label: `Approve ${amountLabel} USDC`, status: 'loading' },
    { label: signStepLabel, status: 'pending' },
  ])

  useEffect(() => {
    const openTimer = window.setTimeout(() => {
      setPromptPhase('approve')
    }, POPUP_OPEN_MS)

    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(completeTimerRef.current)
    }
  }, [])

  function handleApprove() {
    setSteps([
      { label: `Approve ${amountLabel} USDC`, status: 'done' },
      { label: signStepLabel, status: 'loading' },
    ])
    setPromptPhase('sign')
  }

  function handleSign() {
    setSteps([
      { label: `Approve ${amountLabel} USDC`, status: 'done' },
      { label: signStepLabel, status: 'done' },
    ])
    setPromptPhase('closed')
    completeTimerRef.current = window.setTimeout(onComplete, COMPLETE_DELAY_MS)
  }

  function handleReject() {
    setPromptPhase('closed')
    onCancel()
  }

  const showPopup = promptPhase === 'approve' || promptPhase === 'sign'

  return (
    <>
      <div className={styles.column}>
        <div className={modalStepBodyEnter}>
          <h1 className={styles.title}>
            Confirm transactions
            <br />
            on your wallet
          </h1>

          <WalletConfirmList className={styles.confirmList} steps={steps} />
        </div>

        <div className={modalActionRowEnter}>
          <p className={styles.footerText} aria-live="polite" aria-atomic="true">
            Waiting for wallet confirmation
          </p>
        </div>
      </div>

      {showPopup ? (
        <MockMetaMaskPopup
          prompt={promptPhase === 'approve' ? 'approve' : 'sign'}
          amountLabel={amountLabel}
          networkName={networkName}
          accountAddress={walletAddress}
          onConfirm={promptPhase === 'approve' ? handleApprove : handleSign}
          onReject={handleReject}
        />
      ) : null}
    </>
  )
}
