import {
  EyeIcon,
} from '@heroicons/react/24/solid'
import {
  ArrowDownIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { IconButton } from '@/components/IconButton'
import { RollingBalanceValue, type BalanceRollMode } from '@/components/RollingBalanceValue'
import { SendButton } from '@/components/SendButton'
import { Tooltip } from '@/components/Tooltip'
import { formatUsdcAmount } from '@/utils/format'
import styles from './BalanceCard.module.css'

const TOKEN_BADGE_PX = 40
/** @web3icons branded assets use an 18px circle in a 24px viewBox — scale up to fill the badge. */
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface BalanceCardProps {
  balance: number
  balanceRollTrigger?: number
  balanceRollMode?: BalanceRollMode
  balanceRollFromValue?: string
  hasCompletedDeposit?: boolean
  onSend?: () => void
  onDeposit?: () => void
  onRequest?: () => void
  onMore?: () => void
}

export function BalanceCard({
  balance,
  balanceRollTrigger = 0,
  balanceRollMode = 'fromZero',
  balanceRollFromValue,
  hasCompletedDeposit = false,
  onSend,
  onDeposit,
  onRequest,
  onMore,
}: BalanceCardProps) {
  const sendClassName = [styles.sendButton, !hasCompletedDeposit && styles.actionAmber]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.card}>
      <div className={styles.cardBodyTop}>
        <div className={styles.topRow}>
          <div className={`${styles.iconBadge} ${styles.brandBadge}`} aria-hidden>
            <ArmadaLogo variant="mark" markTone="white" className={styles.brandMark} />
          </div>
          <span className={styles.label}>Private USDC</span>
          <div className={`${styles.iconBadge} ${styles.eyeBadge}`} aria-hidden>
            <EyeIcon className={styles.badgeIcon} />
          </div>
        </div>
      </div>

      <div className={styles.cardBodyBalance}>
        <div className={styles.balanceRow}>
          <div className={styles.balanceCluster}>
            <div className={styles.tokenBadge}>
              <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
            </div>
            <span className={styles.balanceValue}>
              <RollingBalanceValue
                value={formatUsdcAmount(balance)}
                enableRoll={balance > 0}
                mode={balanceRollMode}
                fromValue={balanceRollFromValue}
                rollTrigger={balanceRollTrigger}
              />
            </span>
          </div>
        </div>
      </div>

      <div className={styles.actionRow}>
        <div className={styles.actionEnter}>
          <SendButton
            variant={hasCompletedDeposit ? 'gradient' : 'solid'}
            className={sendClassName}
            onClick={onSend}
          />
        </div>
        <div className={styles.actionEnter}>
          <Tooltip variant="action" content="Deposit">
            <IconButton
              variant={hasCompletedDeposit ? 'solid' : 'gradient'}
              className={hasCompletedDeposit ? styles.actionAmber : undefined}
              icon={<PlusIcon className={styles.actionIcon} strokeWidth={1.5} />}
              aria-label="Deposit"
              onClick={onDeposit}
            />
          </Tooltip>
        </div>
        <div className={styles.actionEnter}>
          <Tooltip variant="action" content="Request">
            <IconButton
              variant="solid"
              className={styles.actionAmber}
              icon={<ArrowDownIcon className={styles.actionIcon} strokeWidth={1.5} />}
              aria-label="Request"
              onClick={onRequest}
            />
          </Tooltip>
        </div>
        <div className={styles.actionEnter}>
          <Tooltip variant="action" content="More">
            <IconButton
              variant="ghost"
              className={styles.actionMore}
              icon={<EllipsisHorizontalIcon className={styles.actionIcon} strokeWidth={2} />}
              aria-label="More options"
              onClick={onMore}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
