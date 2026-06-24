import { ChartBarIcon } from '@heroicons/react/24/outline'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { BalanceScrambleValue } from '@/components/BalanceScrambleValue'
import { RollingBalanceValue } from '@/components/RollingBalanceValue'
import { DEMO_EARN_APY } from '@/pages/earnFlowConstants'
import { formatUsdcAmount } from '@/utils/format'
import usdcAmount from '@/styles/usdcAmount.module.css'
import styles from './VaultPositionBar.module.css'

export interface VaultPositionBarProps {
  balance: number
  apy?: number
  vaultRollActive?: boolean
  vaultRollFromValue?: string
  vaultRollTrigger?: number
  balanceRevealed?: boolean
  onOpen?: () => void
}

export function VaultPositionBar({
  balance,
  apy = DEMO_EARN_APY,
  vaultRollActive = false,
  vaultRollFromValue,
  vaultRollTrigger = 0,
  balanceRevealed = true,
  onOpen,
}: VaultPositionBarProps) {
  if (balance <= 0 && !vaultRollActive) return null

  const formattedBalance = formatUsdcAmount(balance)
  const amountLabel = balanceRevealed ? `${formattedBalance} USDC` : 'Vault balance hidden'

  const amountDisplay =
    vaultRollActive && vaultRollFromValue !== undefined && balanceRevealed ? (
      <RollingBalanceValue
        value={formattedBalance}
        enableRoll
        mode="fromValue"
        fromValue={vaultRollFromValue}
        rollTrigger={vaultRollTrigger}
        className={styles.amountRoll}
      />
    ) : (
      <BalanceScrambleValue value={formattedBalance} revealed={balanceRevealed} />
    )

  const apyLabel = `Earning ${apy.toFixed(1)}% APR`

  const content = (
    <>
      <div className={styles.lead}>
        <span className={styles.iconBadge} aria-hidden>
          <ChartBarIcon className={styles.icon} strokeWidth={1.5} />
        </span>
        <div className={styles.info}>
          <span className={[styles.amount, usdcAmount.font].join(' ')} aria-label={amountLabel}>
            {amountDisplay}
            <span className={styles.amountSuffix}>USDC</span>
          </span>
          <span className={styles.apr}>{apyLabel}</span>
        </div>
      </div>

      <ChevronRightIcon className={styles.chevron} strokeWidth={2} aria-hidden />
    </>
  )

  if (onOpen) {
    return (
      <button type="button" className={styles.root} aria-label="Open vault" onClick={onOpen}>
        {content}
      </button>
    )
  }

  return (
    <div className={styles.root} aria-label="Vault position">
      {content}
    </div>
  )
}
