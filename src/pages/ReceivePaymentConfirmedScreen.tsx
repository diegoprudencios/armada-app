import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { ReceivePaymentReviewSummary } from '@/components/ReceivePaymentReviewSummary'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import type { SendChainId } from './sendFlowConstants'
import styles from './DepositConfirmedScreen.module.css'

const TOKEN_BADGE_PX = 40
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

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
      <div className={modalStepBodyEnter}>
        <h1 className={styles.title}>Payment received</h1>

        <div className={styles.amountRow}>
          <div className={styles.amountGroup}>
            <div className={styles.tokenBadge} aria-hidden>
              <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
            </div>
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
        <Button variant="secondary" size="lg" label="View on explorer" showIcon={false} onClick={onViewExplorer} />
        <Button variant="gradient" size="lg" label="Go to dashboard" showIcon={false} onClick={onGoToDashboard} />
      </div>
    </div>
  )
}
