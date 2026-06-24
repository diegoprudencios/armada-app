import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { SendReviewSummary } from '@/components/SendReviewSummary'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { calculateSendFee } from '@/utils/sendFee'
import { formatUsdcAmount } from '@/utils/format'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import { isArmadaAddress, sendNetworkDisplayName, type SendChainId } from './sendFlowConstants'
import styles from './SendReviewScreen.module.css'

const TOKEN_BADGE_PX = 40
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface SendReviewScreenProps {
  amount: string
  recipient: string
  chain: SendChainId
  armadaAddress?: string
  onBack: () => void
  onConfirm: () => void
}

export function SendReviewScreen({
  amount,
  recipient,
  chain,
  armadaAddress,
  onBack,
  onConfirm,
}: SendReviewScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const feeUsdc = calculateSendFee(amountNum)
  const isPrivate = isArmadaAddress(recipient)
  const networkName = isPrivate ? undefined : sendNetworkDisplayName(chain)

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={styles.title}>Review transfer</h1>

        <div className={styles.amountRow}>
          <div className={styles.amountGroup}>
            <div className={styles.tokenBadge} aria-hidden>
              <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
            </div>
            <span className={styles.amountValue}>{formatUsdcAmount(amountNum)}</span>
          </div>
        </div>

        <SendReviewSummary
          recipientAddress={recipient}
          armadaAddress={armadaAddress ?? DEMO_ARMADA_ADDRESS}
          networkName={networkName}
          amount={amountNum}
          feeUsdc={feeUsdc}
        />
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        <Button variant="secondary" size="lg" label="Back" showIcon={false} onClick={onBack} />
        <Button variant="primary" size="lg" label="Confirm send" showIcon={false} onClick={onConfirm} />
      </div>
    </div>
  )
}
