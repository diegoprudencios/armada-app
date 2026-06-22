import { useState } from 'react'
import {
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/solid'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { IconButton } from '@/components/IconButton'
import { RollingBalanceValue, type BalanceRollMode } from '@/components/RollingBalanceValue'
import { BalancePixelMask } from './BalancePixelMask'
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
  onEarn?: () => void
  onWithdraw?: () => void
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
  onEarn,
  onWithdraw,
}: BalanceCardProps) {
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [peekBalance, setPeekBalance] = useState(false)
  const [maskGeneration, setMaskGeneration] = useState(0)
  const formattedBalance = formatUsdcAmount(balance)
  const showBalance = !balanceHidden || peekBalance
  const sendClassName = [styles.sendButton, !hasCompletedDeposit && styles.actionAmber]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.cardShell}>
      <svg
        className={styles.cardStrokeSvg}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="balanceCardStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#be87e9" />
            <stop offset="100%" stopColor="#f3d0a0" />
          </linearGradient>
        </defs>
        <rect
          className={styles.cardStrokeRect}
          x="2"
          y="2"
          width="99%"
          height="99%"
          rx="20"
          ry="20"
          fill="none"
          stroke="url(#balanceCardStroke)"
          strokeWidth="2"
        />
      </svg>
      <div className={styles.card}>
        <div className={styles.cardBodyTop}>
          <div className={styles.topRow}>
            <div className={`${styles.iconBadge} ${styles.brandBadge}`} aria-hidden>
              <ArmadaLogo variant="mark" markTone="white" className={styles.brandMark} />
            </div>
            <span className={styles.label}>Private USDC</span>
            <button
              type="button"
              className={`${styles.iconBadge} ${styles.eyeBadge}`}
              aria-label={balanceHidden ? 'Show balance' : 'Hide balance'}
              aria-pressed={balanceHidden}
              onClick={() => {
                setBalanceHidden((hidden) => {
                  if (!hidden) setMaskGeneration((generation) => generation + 1)
                  return !hidden
                })
                setPeekBalance(false)
              }}
            >
              {balanceHidden ? (
                <EyeSlashIcon className={styles.badgeIcon} />
              ) : (
                <EyeIcon className={styles.badgeIcon} />
              )}
            </button>
          </div>
        </div>

        <div className={styles.cardBodyBalance}>
          <div className={styles.balanceRow}>
            <div
              className={[
                styles.balanceCluster,
                balanceHidden && styles.balanceClusterPrivate,
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => {
                if (balanceHidden) setPeekBalance(true)
              }}
              onMouseLeave={() => setPeekBalance(false)}
            >
              <div className={styles.tokenBadge}>
                <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
              </div>
              <span
                className={[
                  styles.balanceValue,
                  balanceHidden && styles.balanceValueHidden,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={showBalance ? formattedBalance : 'Balance hidden'}
              >
                <span className={styles.balanceValueSizer} aria-hidden>
                  {formattedBalance}
                </span>
                <span
                  className={[
                    styles.balanceValueLayer,
                    showBalance ? styles.balanceValueLayerVisible : styles.balanceValueLayerHidden,
                  ].join(' ')}
                  aria-hidden={!showBalance}
                >
                  <RollingBalanceValue
                    value={formattedBalance}
                    enableRoll={balance > 0}
                    mode={balanceRollMode}
                    fromValue={balanceRollFromValue}
                    rollTrigger={balanceRollTrigger}
                  />
                </span>
                <span
                  className={[
                    styles.balanceValueLayer,
                    showBalance ? styles.balanceValueLayerHidden : styles.balanceValueLayerVisible,
                  ].join(' ')}
                  aria-hidden={showBalance}
                >
                  <BalancePixelMask
                    key={`mask-${maskGeneration}`}
                    seed={formattedBalance}
                  />
                </span>
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
          <div className={`${styles.actionEnter} ${styles.moreMenuRoot}`}>
            <div className={styles.moreMenu} role="menu" aria-label="More options">
              <button type="button" className={styles.moreMenuItem} role="menuitem" onClick={onEarn}>
                <span className={styles.moreMenuItemLead}>
                  <span className={styles.moreMenuIconBadge}>
                    <ChartBarIcon className={styles.moreMenuIcon} strokeWidth={1.5} />
                  </span>
                  <span className={styles.moreMenuLabel}>Earn</span>
                </span>
                <span className={styles.moreMenuMeta}>4.2% APR</span>
              </button>
              <button type="button" className={styles.moreMenuItem} role="menuitem" onClick={onWithdraw ?? onMore}>
                <span className={styles.moreMenuItemLead}>
                  <span className={styles.moreMenuIconBadge}>
                    <ArrowUpIcon className={styles.moreMenuIcon} strokeWidth={1.5} />
                  </span>
                  <span className={styles.moreMenuLabel}>Withdraw</span>
                </span>
              </button>
            </div>
            <IconButton
              variant="ghost"
              className={styles.actionMore}
              icon={<EllipsisHorizontalIcon className={styles.actionIcon} strokeWidth={2} />}
              aria-label="More options"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
