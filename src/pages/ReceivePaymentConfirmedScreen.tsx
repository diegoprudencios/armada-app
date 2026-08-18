import { Button } from '@/components/Button'
import { ReceivePaymentReviewSummary } from '@/components/ReceivePaymentReviewSummary'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import type { SendChainId } from './sendFlowConstants'
import styles from './DepositConfirmedScreen.module.css'

export interface ReceivePaymentConfirmedScreenProps {
  amount: string
  sender: string
  chain: SendChainId
  txHash: string
  confirmedAt: number
  armadaAddress?: string
  onViewExplorer: () => void
  onGoToDashboard: () => void
}

export function ReceivePaymentConfirmedScreen({
  amount,
  sender,
  chain,
  txHash,
  confirmedAt,
  armadaAddress,
  onViewExplorer,
  onGoToDashboard,
}: ReceivePaymentConfirmedScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const amountLabel = formatUsdcAmount(amountNum)

  return (
    <div className={styles.column}>
      <div className={`${styles.body} ${modalStepBodyEnter}`}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Payment received</h1>
          <div className={styles.amountRow}>
            <span className={styles.amountValue}>{amountLabel}</span>
          </div>
        </div>

        <ReceivePaymentReviewSummary
          amount={amountNum}
          sender={sender}
          chain={chain}
          armadaAddress={armadaAddress ?? DEMO_ARMADA_ADDRESS}
          txHash={txHash}
          confirmedAt={confirmedAt}
        />
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        <Button
          variant="secondary"
          size="lg"
          label="View on explorer"
          showIcon={false}
          className={styles.cancelButton}
          onClick={onViewExplorer}
        />
        <Button
          variant="primary"
          size="lg"
          label="Go to dashboard"
          showIcon={false}
          className={styles.confirmButton}
          onClick={onGoToDashboard}
        />
      </div>
    </div>
  )
}
