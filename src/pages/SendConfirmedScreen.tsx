import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { SendReviewSummary } from '@/components/SendReviewSummary'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { calculateSendFee } from '@/utils/sendFee'
import { formatUsdcAmount } from '@/utils/format'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import { isArmadaAddress, type SendChainId, sendNetworkDisplayName } from './sendFlowConstants'
import styles from './SendConfirmedScreen.module.css'

const TOKEN_BADGE_PX = 40
/** @web3icons branded assets use an 18px circle in a 24px viewBox — scale up to fill the badge. */
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface SendConfirmedScreenProps {
  amount: string
  recipient: string
  chain: SendChainId
  armadaAddress?: string
  confirmedAt: number
  onViewExplorer: () => void
  onGoToDashboard: () => void
}

export function SendConfirmedScreen({
  amount,
  recipient,
  chain,
  armadaAddress,
  confirmedAt,
  onViewExplorer,
  onGoToDashboard,
}: SendConfirmedScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const feeUsdc = calculateSendFee(amountNum)
  const isPrivate = isArmadaAddress(recipient)
  const networkName = isPrivate ? undefined : sendNetworkDisplayName(chain)
  const amountLabel = formatUsdcAmount(amountNum)

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={styles.title}>Send confirmed</h1>

        <div className={styles.amountRow}>
          <div className={styles.amountGroup}>
            <div className={styles.tokenBadge} aria-hidden>
              <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
            </div>
            <span className={styles.amountValue}>{amountLabel}</span>
          </div>
        </div>

        <SendReviewSummary
          recipientAddress={recipient}
          armadaAddress={armadaAddress ?? DEMO_ARMADA_ADDRESS}
          networkName={networkName}
          amount={amountNum}
          feeUsdc={feeUsdc}
          confirmedAt={confirmedAt}
        />
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
          <Button
            variant="secondary"
            size="lg"
            label="View on explorer"
            showIcon={false}
            onClick={onViewExplorer}
          />
          <Button
            variant="gradient"
            size="lg"
            label="Go to dashboard"
            showIcon={false}
            onClick={onGoToDashboard}
          />
        </div>
    </div>
  )
}
