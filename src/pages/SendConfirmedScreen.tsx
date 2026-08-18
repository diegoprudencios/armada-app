import { Button } from '@/components/Button'
import { SendReviewSummary } from '@/components/SendReviewSummary'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { calculateSendFee } from '@/utils/sendFee'
import { formatUsdcAmount } from '@/utils/format'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import {
  isArmadaAddress,
  sendConfirmedTitle,
  sendNetworkDisplayName,
  type SendChainId,
  type SendFlowVariant,
} from './sendFlowConstants'
import styles from './SendReviewScreen.module.css'

export interface SendConfirmedScreenProps {
  amount: string
  recipient: string
  chain: SendChainId
  armadaAddress?: string
  confirmedAt: number
  variant?: SendFlowVariant
  onViewExplorer: () => void
  onGoToDashboard: () => void
}

export function SendConfirmedScreen({
  amount,
  recipient,
  chain,
  armadaAddress,
  confirmedAt,
  variant = 'send',
  onViewExplorer,
  onGoToDashboard,
}: SendConfirmedScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const feeUsdc = calculateSendFee(amountNum)
  const isPrivate = isArmadaAddress(recipient)
  const networkName = isPrivate ? undefined : sendNetworkDisplayName(chain)

  return (
    <div className={styles.column}>
      <div className={`${styles.body} ${modalStepBodyEnter}`}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{sendConfirmedTitle(variant)}</h1>
          <div className={styles.amountRow}>
            <span className={styles.amountValue}>{formatUsdcAmount(amountNum)}</span>
          </div>
        </div>

        <SendReviewSummary
          recipientAddress={recipient}
          armadaAddress={armadaAddress ?? DEMO_ARMADA_ADDRESS}
          networkName={networkName}
          amount={amountNum}
          feeUsdc={feeUsdc}
          confirmedAt={confirmedAt}
          variant={variant}
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
