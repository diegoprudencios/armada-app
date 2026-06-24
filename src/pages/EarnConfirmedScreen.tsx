import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
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
import flowStep from '@/styles/modalFlowStep.module.css'
import styles from './EarnConfirmedScreen.module.css'

const TOKEN_BADGE_PX = 40
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface EarnConfirmedScreenProps {
  tab: EarnTab
  amount: string
  apy?: number
  onViewExplorer: () => void
  onGoToDashboard: () => void
}

export function EarnConfirmedScreen({
  tab,
  amount,
  apy = DEMO_EARN_APY,
  onViewExplorer,
  onGoToDashboard,
}: EarnConfirmedScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const feeUsdc = calculateSendFee(amountNum)

  return (
    <div className={flowStep.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={flowStep.title}>{earnConfirmedTitle(tab)}</h1>

        <div className={styles.amountRow}>
          <div className={styles.amountGroup}>
            <div className={styles.tokenBadge} aria-hidden>
              <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
            </div>
            <span className={styles.amountValue}>{formatUsdcAmount(amountNum)}</span>
          </div>
        </div>

        <EarnReviewSummary tab={tab} amount={amountNum} apy={apy} feeUsdc={feeUsdc} />
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
