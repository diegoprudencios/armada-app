import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CLIPBOARD_COPIED_RESET_MS } from '@/constants/clipboard'
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { BalanceActionButton } from '@/components/BalanceActionButton'
import { RollingBalanceValue, type BalanceRollMode } from '@/components/RollingBalanceValue'
import { BalanceScrambleValue } from '@/components/BalanceScrambleValue'
import {
  BALANCE_REVEAL_DELAY_MS,
  BALANCE_REVEAL_DURATION_MS,
  balanceRollSettleMs,
  prefersReducedMotion,
  vaultPositionExitDurationMs,
} from './balanceRevealMotion'
import { VaultPositionBar } from '@/components/VaultPositionBar'
import { useDashboardBackground } from '@/hooks/useDashboardBackground'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { formatUsdcAmount, truncateArmadaAddress } from '@/utils/format'
import styles from './BalanceCard.module.css'

export interface BalanceCardProps {
  balance: number
  balanceRollTrigger?: number
  balanceRollMode?: BalanceRollMode
  balanceRollFromValue?: string
  /** When true, show hide/show activity in the ellipses menu. */
  hasActivityItems?: boolean
  onSend?: () => void
  onDeposit?: () => void
  onRequest?: () => void
  onEarn?: () => void
  vaultBalance?: number
  vaultApy?: number
  vaultRollFromValue?: string
  onVaultOpen?: () => void
  activityVisible?: boolean
  onToggleActivity?: () => void
  balanceHidden?: boolean
  onBalanceHiddenChange?: (hidden: boolean) => void
  /** User's shielded Armada address — shown above the balance label when set. */
  armadaAddress?: string
}

const BALANCE_BASE_FONT_SIZE_PX = 44
const BALANCE_MIN_FONT_SIZE_PX = 24

function fitBalanceFontSize(rowWidth: number, naturalTextWidth: number): number {
  const maxTextWidth = Math.max(0, rowWidth)
  if (maxTextWidth === 0 || naturalTextWidth <= maxTextWidth) {
    return BALANCE_BASE_FONT_SIZE_PX
  }

  const scaled = (BALANCE_BASE_FONT_SIZE_PX * maxTextWidth) / naturalTextWidth
  return Math.max(BALANCE_MIN_FONT_SIZE_PX, scaled)
}

function estimateDepositRollDurationMs(formattedBalance: string): number {
  return balanceRollSettleMs(formattedBalance)
}

export function BalanceCard({
  balance,
  balanceRollTrigger = 0,
  balanceRollMode = 'fromZero',
  balanceRollFromValue,
  onSend,
  onDeposit,
  onRequest,
  onEarn,
  vaultBalance = 0,
  vaultApy,
  vaultRollFromValue,
  onVaultOpen,
  balanceHidden: balanceHiddenProp,
  onBalanceHiddenChange,
  armadaAddress,
}: BalanceCardProps) {
  const isMobileLayout = useMobileLayout()
  const [background] = useDashboardBackground()
  const isSolidBackground = background === 'solid'
  const [internalBalanceHidden, setInternalBalanceHidden] = useState(false)
  const balanceHiddenControlled = balanceHiddenProp !== undefined
  const balanceHidden = balanceHiddenControlled ? balanceHiddenProp : internalBalanceHidden
  const setBalanceHidden = (next: boolean | ((hidden: boolean) => boolean)) => {
    const resolved = typeof next === 'function' ? next(balanceHidden) : next
    onBalanceHiddenChange?.(resolved)
    if (!balanceHiddenControlled) {
      setInternalBalanceHidden(resolved)
    }
  }
  const [peekBalance, setPeekBalance] = useState(false)
  const [balanceIntroPlaying, setBalanceIntroPlaying] = useState(() => !prefersReducedMotion())
  const balanceRowRef = useRef<HTMLDivElement>(null)
  const balanceValueRef = useRef<HTMLSpanElement>(null)
  const balanceValueSizerRef = useRef<HTMLSpanElement>(null)
  const [balanceFontSize, setBalanceFontSize] = useState(BALANCE_BASE_FONT_SIZE_PX)
  const [lockedWidth, setLockedWidth] = useState<number | null>(null)
  const [completedRollTrigger, setCompletedRollTrigger] = useState(0)
  const [armadaAddressCopied, setArmadaAddressCopied] = useState(false)
  const armadaAddressCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (armadaAddressCopyTimerRef.current) clearTimeout(armadaAddressCopyTimerRef.current)
    }
  }, [])

  async function copyArmadaAddress() {
    if (!armadaAddress) return
    try {
      await navigator.clipboard.writeText(armadaAddress)
      setArmadaAddressCopied(true)
      if (armadaAddressCopyTimerRef.current) clearTimeout(armadaAddressCopyTimerRef.current)
      armadaAddressCopyTimerRef.current = setTimeout(() => setArmadaAddressCopied(false), CLIPBOARD_COPIED_RESET_MS)
    } catch {
      setArmadaAddressCopied(false)
    }
  }

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

    const vaultDigits = vaultRollFromValue?.replace(/\D/g, '').length ?? 0
    const balanceDigits = formattedBalance.replace(/\D/g, '').length
    const durationSource =
      vaultDigits > balanceDigits && vaultRollFromValue ? vaultRollFromValue : formattedBalance

    const timer = window.setTimeout(
      () => setCompletedRollTrigger(balanceRollTrigger),
      estimateDepositRollDurationMs(durationSource),
    )
    return () => window.clearTimeout(timer)
  }, [balanceRollTrigger, completedRollTrigger, formattedBalance, vaultRollFromValue])

  useLayoutEffect(() => {
    if (balanceIntroPlaying) return
    const width = balanceValueSizerRef.current?.scrollWidth
    if (!width) return
    setLockedWidth(width)
  }, [balanceIntroPlaying, formattedBalance, balanceFontSize])

  useLayoutEffect(() => {
    if (balanceIntroPlaying) {
      setBalanceFontSize(BALANCE_BASE_FONT_SIZE_PX)
      return
    }

    const row = balanceRowRef.current
    const balanceValue = balanceValueRef.current
    const sizer = balanceValueSizerRef.current
    if (!row || !balanceValue || !sizer) return

    const updateFit = () => {
      balanceValue.style.setProperty('font-size', `${BALANCE_BASE_FONT_SIZE_PX}px`)
      balanceValue.style.setProperty('line-height', `${BALANCE_BASE_FONT_SIZE_PX}px`)
      const naturalWidth = sizer.scrollWidth
      balanceValue.style.removeProperty('font-size')
      balanceValue.style.removeProperty('line-height')
      setBalanceFontSize(fitBalanceFontSize(row.clientWidth, naturalWidth))
    }

    updateFit()

    const observer = new ResizeObserver(updateFit)
    observer.observe(row)
    return () => observer.disconnect()
  }, [formattedBalance, balanceIntroPlaying])

  const showBalance = !balanceHidden || peekBalance
  const depositRollActive =
    !balanceIntroPlaying &&
    showBalance &&
    !balanceHidden &&
    balance > 0 &&
    balanceRollTrigger > completedRollTrigger
  const vaultTransferRollActive =
    !balanceIntroPlaying &&
    vaultRollFromValue !== undefined &&
    balanceRollTrigger > completedRollTrigger
  const showRollingBalance = balanceIntroPlaying || depositRollActive
  const lockBalanceWidth = showRollingBalance || vaultTransferRollActive

  function revealBalancePeek() {
    if (balanceHidden) setPeekBalance(true)
  }

  function hideBalancePeek() {
    setPeekBalance(false)
  }

  const balancePeekHandlers = isMobileLayout
    ? {
        onPointerDown: revealBalancePeek,
        onPointerUp: hideBalancePeek,
        onPointerCancel: hideBalancePeek,
      }
    : {
        onMouseEnter: revealBalancePeek,
        onMouseLeave: hideBalancePeek,
      }

  const balanceClusterLayers = (
    <span
      ref={balanceValueRef}
      className={styles.balanceValue}
      style={
        {
          '--balance-font-size': `${balanceFontSize}px`,
          ...(balanceIntroPlaying
            ? undefined
            : lockBalanceWidth
              ? { width: lockedWidth ?? 'max-content' }
              : undefined),
        } as React.CSSProperties
      }
      aria-label={showBalance ? formattedBalance : 'Balance hidden'}
    >
      <span ref={balanceValueSizerRef} className={styles.balanceValueSizer} aria-hidden>
        {formattedBalance}
      </span>
      <span className={[styles.balanceValueLayer, styles.balanceValueLayerVisible].join(' ')}>
        {showRollingBalance ? (
          <RollingBalanceValue
            value={formattedBalance}
            enableRoll={balanceIntroPlaying ? balance > 0 : depositRollActive}
            mode={balanceRollMode}
            fromValue={balanceRollFromValue}
            rollTrigger={balanceRollTrigger}
          />
        ) : (
          <BalanceScrambleValue value={formattedBalance} revealed={showBalance} />
        )}
      </span>
    </span>
  )

  const lastPositiveVaultRef = useRef(vaultBalance > 0 ? vaultBalance : 0)
  if (vaultBalance > 0) lastPositiveVaultRef.current = vaultBalance

  const showVaultPosition = vaultBalance > 0 || vaultTransferRollActive
  const vaultBarWasRevealed = useRef(vaultBalance > 0)
  const [vaultExiting, setVaultExiting] = useState(false)
  const vaultMounted = showVaultPosition || vaultExiting
  const vaultEnterSync =
    showVaultPosition && !vaultExiting && !vaultBarWasRevealed.current && vaultTransferRollActive
  const shouldAnimateVaultEnter =
    showVaultPosition && !vaultExiting && !vaultBarWasRevealed.current && !vaultTransferRollActive

  if (showVaultPosition) {
    vaultBarWasRevealed.current = true
  }

  useEffect(() => {
    if (showVaultPosition) {
      setVaultExiting(false)
      return
    }

    if (lastPositiveVaultRef.current <= 0) {
      vaultBarWasRevealed.current = false
      return
    }

    vaultBarWasRevealed.current = false
    setVaultExiting(true)
    const timer = window.setTimeout(() => {
      setVaultExiting(false)
      lastPositiveVaultRef.current = 0
    }, vaultPositionExitDurationMs())
    return () => window.clearTimeout(timer)
  }, [showVaultPosition])

  return (
    <div className={styles.cardShell}>
      <div
        className={[styles.card, isSolidBackground && styles.cardSolid].filter(Boolean).join(' ')}
      >
        <button
          type="button"
          className={styles.visibilityToggle}
          aria-label={balanceHidden ? 'Show balance' : 'Hide balance'}
          aria-pressed={balanceHidden}
          onClick={() => {
            setBalanceHidden((hidden) => !hidden)
            setPeekBalance(false)
          }}
        >
          {balanceHidden ? (
            <EyeSlashIcon className={styles.badgeIcon} strokeWidth={1.5} aria-hidden />
          ) : (
            <EyeIcon className={styles.badgeIcon} strokeWidth={1.5} aria-hidden />
          )}
        </button>

        <div className={styles.contentArea}>
          <div className={styles.headerBlock}>
            <div className={styles.headingStack}>
              {armadaAddress ? (
                <button
                  type="button"
                  className={[
                    'armada-text-ui-label-md',
                    styles.armadaAddress,
                    armadaAddressCopied && styles.armadaAddressCopied,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => void copyArmadaAddress()}
                  title={armadaAddressCopied ? undefined : armadaAddress}
                  aria-label={
                    armadaAddressCopied
                      ? 'Address copied'
                      : `Copy Armada address ${truncateArmadaAddress(armadaAddress)}`
                  }
                >
                  {armadaAddressCopied ? 'Copied' : truncateArmadaAddress(armadaAddress)}
                </button>
              ) : null}
              <div className={styles.balanceStack}>
                <span className={`armada-text-ui-label-md ${styles.label}`}>USDC shielded balance</span>
                <div className={styles.balanceRow} ref={balanceRowRef}>
                  {balanceIntroPlaying ? (
                    <div
                      className={[styles.balanceCluster, styles.balanceClusterIntro].join(' ')}
                      {...balancePeekHandlers}
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
                      {...balancePeekHandlers}
                    >
                      {balanceClusterLayers}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <div className={styles.actionEnter}>
              <BalanceActionButton
                variant="primary"
                label="Shield"
                icon={<PlusIcon strokeWidth={1.5} />}
                onClick={onDeposit}
                testingClickId="deposit_button"
              />
            </div>
            <div className={styles.actionEnter}>
              <BalanceActionButton
                label="Send"
                icon={<ArrowRightIcon strokeWidth={1.5} />}
                onClick={onSend}
                testingClickId="send_button"
              />
            </div>
            <div className={styles.actionEnter}>
              <BalanceActionButton
                label="Request"
                icon={<ArrowDownIcon strokeWidth={1.5} />}
                onClick={onRequest}
                testingClickId="request_button"
              />
            </div>
            <div className={styles.actionEnter}>
              <BalanceActionButton
                label="Earn"
                icon={<ChartBarIcon strokeWidth={1.5} />}
                onClick={onEarn}
                testingClickId="vault_open_button"
              />
            </div>
          </div>
        </div>

        {vaultMounted ? (
          <div
            className={[
              styles.vaultPositionWrap,
              vaultExiting
                ? styles.vaultPositionExit
                : vaultEnterSync
                  ? styles.vaultPositionEnterSync
                  : shouldAnimateVaultEnter
                    ? styles.vaultPositionEnter
                    : styles.vaultPositionVisible,
            ].join(' ')}
          >
            <div className={styles.vaultPositionInner}>
              <VaultPositionBar
                balance={vaultBalance}
                apy={vaultApy}
                vaultRollActive={vaultTransferRollActive && !vaultExiting}
                vaultRollFromValue={vaultRollFromValue}
                vaultRollTrigger={balanceRollTrigger}
                keepMounted={vaultExiting}
                balanceHidden={balanceHidden}
                onOpen={onVaultOpen ?? onEarn}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
