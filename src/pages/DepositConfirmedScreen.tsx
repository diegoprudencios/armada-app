import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import styles from './DepositConfirmedScreen.module.css'

const TOKEN_BADGE_PX = 40
/** @web3icons branded assets use an 18px circle in a 24px viewBox — scale up to fill the badge. */
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface DepositConfirmedScreenProps {
  amount: string
  onViewExplorer: () => void
  onGoToDashboard: () => void
}

export function DepositConfirmedScreen({
  amount,
  onViewExplorer,
  onGoToDashboard,
}: DepositConfirmedScreenProps) {
  const amountLabel = formatUsdcAmount(parseActiveAmount(amount))

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={styles.title}>Deposit confirmed</h1>

        <div className={styles.amountGroup}>
          <div className={styles.tokenBadge} aria-hidden>
            <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
          </div>
          <span className={styles.amountValue}>{amountLabel}</span>
        </div>
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
