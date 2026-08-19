import { Button } from '@/components/Button'
import { EarnReviewSummary } from '@/components/EarnReviewSummary'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { calculateSendFee } from '@/utils/sendFee'
import { formatUsdcAmount } from '@/utils/format'
import {
  DEMO_EARN_APY,
  earnConfirmedTitle,
  type EarnTab,
} from './earnFlowConstants'
import styles from './ConfirmedScreen.module.css'

export interface EarnConfirmedScreenProps {
  tab: EarnTab
  amount: string
  apy?: number
  confirmedAt: number
  onViewExplorer: () => void
  onGoToDashboard: () => void
}

export function EarnConfirmedScreen({
  tab,
  amount,
  apy = DEMO_EARN_APY,
  confirmedAt,
  onViewExplorer,
  onGoToDashboard,
}: EarnConfirmedScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const feeUsdc = calculateSendFee(amountNum)
  const amountLabel = formatUsdcAmount(amountNum)

  return (
    <div className={styles.column}>
      <div className={`${styles.body} ${modalStepBodyEnter}`}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{earnConfirmedTitle(tab)}</h1>
          <div className={styles.amountRow}>
            <span className={styles.amountValue}>{amountLabel}</span>
          </div>
        </div>

        <EarnReviewSummary tab={tab} amount={amountNum} apy={apy} feeUsdc={feeUsdc} confirmedAt={confirmedAt} />
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
