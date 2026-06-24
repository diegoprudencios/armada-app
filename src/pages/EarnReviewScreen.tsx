import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { EarnReviewSummary } from '@/components/EarnReviewSummary'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { calculateSendFee } from '@/utils/sendFee'
import { formatUsdcAmount } from '@/utils/format'
import {
  DEMO_EARN_APY,
  earnConfirmLabel,
  earnReviewTitle,
  type EarnTab,
} from './earnFlowConstants'
import flowStep from '@/styles/modalFlowStep.module.css'
import styles from './EarnReviewScreen.module.css'

const TOKEN_BADGE_PX = 40
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface EarnReviewScreenProps {
  tab: EarnTab
  amount: string
  apy?: number
  onBack: () => void
  onConfirm: () => void
}

export function EarnReviewScreen({
  tab,
  amount,
  apy = DEMO_EARN_APY,
  onBack,
  onConfirm,
}: EarnReviewScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const feeUsdc = calculateSendFee(amountNum)

  return (
    <div className={flowStep.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={flowStep.title}>{earnReviewTitle(tab)}</h1>

        <div className={styles.amountRow}>
          <div className={styles.amountGroup}>
            <div className={styles.tokenBadge} aria-hidden>
              <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
            </div>
            <span className={styles.amountValue}>{formatUsdcAmount(amountNum)}</span>
          </div>
        </div>

        <EarnReviewSummary tab={tab} amount={amountNum} apy={apy} feeUsdc={feeUsdc} />

        {tab === 'withdraw' ? (
          <p className={styles.slippageNotice}>
            The vault rate moves with each new block. Your final USDC may differ slightly from
            this quote.
          </p>
        ) : null}
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        <Button variant="secondary" size="lg" label="Back" showIcon={false} onClick={onBack} />
        <Button
          variant="primary"
          size="lg"
          label={earnConfirmLabel(tab)}
          showIcon={false}
          onClick={onConfirm}
        />
      </div>
    </div>
  )
}
