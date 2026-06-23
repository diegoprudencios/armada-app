import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
import { BalanceScrambleValue } from '@/components/BalanceScrambleValue'
import {
  BALANCE_REVEAL_DELAY_MS,
  BALANCE_REVEAL_DURATION_MS,
  BALANCE_ROLL_DIGIT_STAGGER_MS,
  balanceRevealRollDurationMs,
} from './balanceRevealMotion'
import { SendButton } from '@/components/SendButton'
import { Tooltip } from '@/components/Tooltip'
import { useDashboardBackground } from '@/hooks/useDashboardBackground'
import { formatUsdcAmount } from '@/utils/format'
import styles from './BalanceCard.module.css'

const TOKEN_BADGE_PX = 40
/** @web3icons branded assets use an 18px circle in a 24px viewBox — scale up to fill the badge. */
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export type BalanceCardActionLayout = 'default' | 'v2'

export interface BalanceCardProps {
  balance: number
  balanceRollTrigger?: number
  balanceRollMode?: BalanceRollMode
  balanceRollFromValue?: string
  hasCompletedDeposit?: boolean
  /** v2: deposit in ellipses menu; request as lavender pill beside send. */
  actionLayout?: BalanceCardActionLayout
  onSend?: () => void
  onDeposit?: () => void
  onRequest?: () => void
  onMore?: () => void
  onEarn?: () => void
  onWithdraw?: () => void
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const BALANCE_CLUSTER_GAP_PX = 8

function estimateDepositRollDurationMs(formattedBalance: string): number {
  const digitCount = formattedBalance.replace(/\D/g, '').length
  const stagger = Math.max(0, digitCount - 1) * BALANCE_ROLL_DIGIT_STAGGER_MS
  return balanceRevealRollDurationMs() + stagger + 80
}

export function BalanceCard({
  balance,
  balanceRollTrigger = 0,
  balanceRollMode = 'fromZero',
  balanceRollFromValue,
  hasCompletedDeposit = false,
  actionLayout = 'default',
  onSend,
  onDeposit,
  onRequest,
  onMore,
  onEarn,
  onWithdraw,
}: BalanceCardProps) {
  const isV2Actions = actionLayout === 'v2'
  const [background] = useDashboardBackground()
  const isSolidBackground = background === 'solid'
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [peekBalance, setPeekBalance] = useState(false)
  const [balanceIntroPlaying, setBalanceIntroPlaying] = useState(() => !prefersReducedMotion())
  const balanceValueRef = useRef<HTMLSpanElement>(null)
  const balanceValueSizerRef = useRef<HTMLSpanElement>(null)
  const [balanceOffset, setBalanceOffset] = useState('0px')
  const [lockedWidth, setLockedWidth] = useState<number | null>(null)
  const [completedRollTrigger, setCompletedRollTrigger] = useState(0)

  useEffect(() => {
    if (!balanceIntroPlaying) return
    const timer = window.setTimeout(
      () => setBalanceIntroPlaying(false),
      BALANCE_REVEAL_DELAY_MS + BALANCE_REVEAL_DURATION_MS + 50,
    )
    return () => window.clearTimeout(timer)
  }, [balanceIntroPlaying])

  const formattedBalance = formatUsdcAmount(balance)

  useEffect(() => {
    if (balanceRollTrigger <= completedRollTrigger) return

    const timer = window.setTimeout(
      () => setCompletedRollTrigger(balanceRollTrigger),
      estimateDepositRollDurationMs(formattedBalance),
    )
    return () => window.clearTimeout(timer)
  }, [balanceRollTrigger, completedRollTrigger, formattedBalance])

  useLayoutEffect(() => {
    if (!balanceIntroPlaying) return
    const width = balanceValueRef.current?.getBoundingClientRect().width
    if (!width) return
    setBalanceOffset(`${(width + BALANCE_CLUSTER_GAP_PX) / 2}px`)
  }, [balanceIntroPlaying, formattedBalance])

  useLayoutEffect(() => {
    if (balanceIntroPlaying) return
    const width = balanceValueSizerRef.current?.getBoundingClientRect().width
    if (!width) return
    setLockedWidth(width)
  }, [balanceIntroPlaying, formattedBalance])

  const showBalance = !balanceHidden || peekBalance
  const depositRollActive =
    !balanceIntroPlaying &&
    showBalance &&
    !balanceHidden &&
    balance > 0 &&
    balanceRollTrigger > completedRollTrigger
  const showRollingBalance = balanceIntroPlaying || depositRollActive
  const sendClassName = [styles.sendButton, !hasCompletedDeposit && styles.actionAmber]
    .filter(Boolean)
    .join(' ')

  const balanceClusterLayers = (
    <>
      <div
        className={styles.tokenBadge}
        onAnimationEnd={
          balanceIntroPlaying
            ? (event) => {
                if (event.target !== event.currentTarget) return
                setBalanceIntroPlaying(false)
              }
            : undefined
        }
      >
        <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
      </div>
      <span
        ref={balanceValueRef}
        className={styles.balanceValue}
        style={balanceIntroPlaying ? undefined : { width: lockedWidth ?? 'max-content' }}
        aria-label={showBalance ? formattedBalance : 'Balance hidden'}
      >
        <span ref={balanceValueSizerRef} className={styles.balanceValueSizer} aria-hidden>
          {formattedBalance}
        </span>
        <span
          className={[
            styles.balanceValueLayer,
            styles.balanceValueLayerVisible,
          ].join(' ')}
        >
          {showRollingBalance ? (
            <RollingBalanceValue
              value={formattedBalance}
              enableRoll={balanceIntroPlaying ? balance > 0 : depositRollActive}
              mode={balanceRollMode}
              fromValue={balanceRollFromValue}
              rollTrigger={balanceRollTrigger}
            />
          ) : (
            <BalanceScrambleValue
              value={formattedBalance}
              revealed={showBalance}
            />
          )}
        </span>
      </span>
    </>
  )

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
      <div
        className={[styles.card, isSolidBackground && styles.cardSolid].filter(Boolean).join(' ')}
      >
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
                setBalanceHidden((hidden) => !hidden)
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
          <div
            className={styles.balanceRow}
            onMouseEnter={() => {
              if (balanceHidden) setPeekBalance(true)
            }}
            onMouseLeave={() => setPeekBalance(false)}
          >
            {balanceIntroPlaying ? (
              <div
                className={[styles.balanceCluster, styles.balanceClusterIntro].join(' ')}
                style={{ '--balance-offset': balanceOffset } as React.CSSProperties}
              >
                {balanceClusterLayers}
              </div>
            ) : (
              <div
                className={[
                  styles.balanceCluster,
                  styles.balanceClusterStable,
                  balanceHidden && styles.balanceClusterPrivate,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {balanceClusterLayers}
              </div>
            )}
          </div>
        </div>

        <div
          className={[styles.actionRow, isV2Actions && styles.actionRowV2].filter(Boolean).join(' ')}
        >
          <div className={styles.actionEnter}>
            <SendButton
              variant={hasCompletedDeposit ? 'gradient' : 'solid'}
              className={sendClassName}
              onClick={onSend}
            />
          </div>
          {isV2Actions ? (
            <div className={styles.actionEnter}>
              <SendButton
                variant="lavender"
                label="REQUEST"
                icon={<ArrowDownIcon className={styles.pillIcon} strokeWidth={1.5} />}
                className={sendClassName}
                onClick={onRequest}
              />
            </div>
          ) : (
            <>
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
            </>
          )}
          <div className={`${styles.actionEnter} ${styles.moreMenuRoot}`}>
            <div className={styles.moreMenu} role="menu" aria-label="More options">
              {isV2Actions ? (
                <button type="button" className={styles.moreMenuItem} role="menuitem" onClick={onDeposit}>
                  <span className={styles.moreMenuItemLead}>
                    <span className={styles.moreMenuIconBadge}>
                      <PlusIcon className={styles.moreMenuIcon} strokeWidth={1.5} />
                    </span>
                    <span className={styles.moreMenuLabel}>Deposit</span>
                  </span>
                </button>
              ) : null}
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
