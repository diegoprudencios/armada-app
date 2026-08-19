import { Button } from '@/components/Button'
import { RequestReceiveReviewSummary } from '@/components/RequestReceiveReviewSummary'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import styles from './ConfirmedScreen.module.css'

export interface RequestPaidConfirmedScreenProps {
  amount: string
  note?: string
  txHash: string
  confirmedAt: number
  armadaAddress?: string
  onViewExplorer: () => void
  onGoToDashboard: () => void
}

export function RequestPaidConfirmedScreen({
  amount,
  note,
  txHash,
  confirmedAt,
  armadaAddress,
  onViewExplorer,
  onGoToDashboard,
}: RequestPaidConfirmedScreenProps) {
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

        <RequestReceiveReviewSummary
          amount={amountNum}
          armadaAddress={armadaAddress ?? DEMO_ARMADA_ADDRESS}
          txHash={txHash}
          confirmedAt={confirmedAt}
          note={note}
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
