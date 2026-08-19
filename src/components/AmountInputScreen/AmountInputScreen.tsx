import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from 'react'
import { WalletIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/Button'
import iconButtonStyles from '@/components/IconButton/IconButton.module.css'
import { SegmentedControl } from '@/components/SegmentedControl'
import { AmountExceededWarning } from '@/components/AmountExceededWarning'
import { NumericKeypad, type NumericKeypadKey } from '@/components/NumericKeypad'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import {
  BALANCE_ROLL_DIGIT_STAGGER_MS,
  BALANCE_ROLL_DURATION_MS,
} from '@/components/BalanceCard/balanceRevealMotion'
import { RollingBalanceValue } from '@/components/RollingBalanceValue'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { useNudgeShake } from '@/hooks/useNudgeShake'
import nudgeStyles from '@/styles/incompleteCtaNudge.module.css'
import {
  amountExceedsBalance,
  applyKeypadBackspace,
  applyKeypadDecimal,
  applyKeypadDigit,
  formatAmountInputDisplay,
  formatSanitizedAmountFromNumber,
  hasActiveAmount,
  parseActiveAmount,
  sanitizeAmountInput,
} from '@/utils/amountInput'
import { depositAmountExceedsBalance, maxDepositAmount } from '@/utils/depositFee'
import { formatWalletBalance } from '@/utils/format'
import { formatShieldFeeCaption } from '@/utils/protocolFee'
import styles from './AmountInputScreen.module.css'

export type AmountInputBalanceMode = 'simple' | 'deposit-fee-aware'
export type AmountInputPrimaryLabelMode = 'dynamic' | 'static'
/** `input` = system keyboard (default). `keypad` = on-screen numeric pad. */
export type AmountInputEntryMode = 'input' | 'keypad'
export type AmountInputLayout = 'default' | 'shield'
export type ShieldDirection = 'shield' | 'unshield'

export interface AmountInputScreenProps {
  title: string
  balance: number
  amount: string
  amountAriaLabel: string
  exceedMessage: string
  onAmountChange: (amount: string) => void
  onReview: () => void
  secondaryAction: {
    label: string
    onClick: () => void
  }
  calculateFee: (amount: number) => number
  balanceMode?: AmountInputBalanceMode
  primaryLabelMode?: AmountInputPrimaryLabelMode
  /** Overrides dynamic/static primary CTA label (e.g. Request uses “Continue”). */
  primaryActionLabel?: string
  /** When false, hide wallet balance + percent pills (e.g. Request has no balance cap). */
  showBalanceControls?: boolean
  entryMode?: AmountInputEntryMode
  headerSlot?: ReactNode
  /** Rendered above the amount card (e.g. Earn APY hint). */
  introSlot?: ReactNode
  footerSlot?: ReactNode
  /** Hide the in-card heading (amount field still uses `amountAriaLabel`). */
  hideTitle?: boolean
  /** Re-focus amount input when this value changes (e.g. Earn tab). */
  focusKey?: unknown
  /** Optional ref for modal initial focus on open (input mode only). */
  amountInputRef?: Ref<HTMLInputElement>
  columnClassName?: string
  titleClassName?: string
  /** `shield` = Shield/Unshield tabs, glass card. */
  layout?: AmountInputLayout
  shieldDirection?: ShieldDirection
  onShieldDirectionChange?: (direction: ShieldDirection) => void
}

function formatAmountInputValue(value: number): string {
  return formatSanitizedAmountFromNumber(value)
}

function resolveMaxAmount(balance: number, balanceMode: AmountInputBalanceMode): number {
  return balanceMode === 'deposit-fee-aware' ? maxDepositAmount(balance) : balance
}

function resolveExceedsBalance(
  amount: string,
  balance: number,
  balanceMode: AmountInputBalanceMode,
): boolean {
  if (balanceMode === 'deposit-fee-aware') {
    return depositAmountExceedsBalance(parseActiveAmount(amount), balance)
  }
  return amountExceedsBalance(amount, balance)
}

function commitAmount(next: string, onAmountChange: (amount: string) => void) {
  onAmountChange(hasActiveAmount(next) ? next : '')
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function amountPercentRollMs(formatted: string): number {
  const digitCount = formatted.replace(/\D/g, '').length
  return (
    BALANCE_ROLL_DURATION_MS +
    Math.max(0, digitCount - 1) * BALANCE_ROLL_DIGIT_STAGGER_MS +
    80
  )
}

export function AmountInputScreen({
  title,
  balance,
  amount,
  amountAriaLabel,
  exceedMessage,
  onAmountChange,
  onReview,
  secondaryAction,
  calculateFee,
  balanceMode = 'simple',
  primaryLabelMode = 'dynamic',
  primaryActionLabel,
  showBalanceControls = true,
  entryMode = 'input',
  headerSlot,
  introSlot,
  footerSlot,
  hideTitle = false,
  focusKey,
  amountInputRef: amountInputRefProp,
  columnClassName,
  titleClassName,
  layout = 'default',
  shieldDirection = 'shield',
  onShieldDirectionChange,
}: AmountInputScreenProps) {
  const isShieldLayout = layout === 'shield'
  const isMobile = useMobileLayout()
  const amountInputId = useId()
  const amountErrorId = useId()
  const amountDisplayId = useId()
  const feeCaptionId = useId()
  const internalAmountInputRef = useRef<HTMLInputElement | null>(null)
  const amountDisplayRef = useRef<HTMLParagraphElement | null>(null)
  const { shaking, nudge, onShakeAnimationEnd } = useNudgeShake()
  const isKeypad = entryMode === 'keypad'
  /** Mobile keypad: single sticky CTA, no cancel. */
  const isKeypadMobile = isKeypad && isMobile


  const setAmountInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      internalAmountInputRef.current = node
      if (!amountInputRefProp) return
      if (typeof amountInputRefProp === 'function') {
        amountInputRefProp(node)
      } else if (amountInputRefProp) {
        ;(amountInputRefProp as MutableRefObject<HTMLInputElement | null>).current = node
      }
    },
    [amountInputRefProp],
  )
  const balanceDisplay = formatWalletBalance(balance)
  const hasAmount = hasActiveAmount(amount)
  const exceedsBalance = showBalanceControls
    ? resolveExceedsBalance(amount, balance, balanceMode)
    : false
  const canReview = hasAmount && !exceedsBalance

  function handleIncompleteCta() {
    nudge()
    if (isKeypad) {
      amountDisplayRef.current?.focus()
      return
    }
    internalAmountInputRef.current?.focus()
  }
  const primaryLabel = canReview
    ? (primaryActionLabel ?? 'Review')
    : 'Input amount'
  const feeUsdc = calculateFee(parseActiveAmount(amount))
  const feeCaption = formatShieldFeeCaption(feeUsdc)
  const showFeeRow = hasAmount && feeUsdc > 0
  const showFeeCaption = showBalanceControls
  const maxAmount = resolveMaxAmount(balance, balanceMode)
  const displayAmount = formatAmountInputDisplay(amount)
  const [amountRoll, setAmountRoll] = useState<{
    fromValue: string
    toValue: string
    trigger: number
  } | null>(null)
  const amountRollTimeoutRef = useRef<number | null>(null)
  const isAmountRolling = amountRoll !== null

  function clearAmountRoll() {
    if (amountRollTimeoutRef.current !== null) {
      window.clearTimeout(amountRollTimeoutRef.current)
      amountRollTimeoutRef.current = null
    }
    setAmountRoll(null)
  }

  function applyPresetAmount(next: string) {
    const toValue = formatAmountInputDisplay(next) || '0'
    const fromValue = displayAmount || '0'
    commitAmount(next, onAmountChange)

    if (prefersReducedMotion() || fromValue === toValue) {
      clearAmountRoll()
      return
    }

    if (amountRollTimeoutRef.current !== null) {
      window.clearTimeout(amountRollTimeoutRef.current)
    }

    setAmountRoll((prev) => ({
      fromValue,
      toValue,
      trigger: (prev?.trigger ?? 0) + 1,
    }))
    amountRollTimeoutRef.current = window.setTimeout(() => {
      amountRollTimeoutRef.current = null
      setAmountRoll(null)
    }, amountPercentRollMs(toValue))
  }

  function handleAmountChange(raw: string) {
    clearAmountRoll()
    commitAmount(sanitizeAmountInput(raw), onAmountChange)
  }

  function handleKeypadKey(key: NumericKeypadKey) {
    clearAmountRoll()
    if (key === 'backspace') {
      commitAmount(applyKeypadBackspace(amount), onAmountChange)
      return
    }
    if (key === '.') {
      commitAmount(applyKeypadDecimal(amount), onAmountChange)
      return
    }
    commitAmount(applyKeypadDigit(amount, key), onAmountChange)
  }

  function applyPercent(percent: number) {
    applyPresetAmount(formatAmountInputValue(maxAmount * percent))
  }

  function handleMax() {
    applyPresetAmount(formatAmountInputValue(maxAmount))
  }

  useEffect(() => {
    return () => {
      if (amountRollTimeoutRef.current !== null) {
        window.clearTimeout(amountRollTimeoutRef.current)
      }
    }
  }, [])

  const prevFocusKeyRef = useRef(focusKey)
  useEffect(() => {
    if (prevFocusKeyRef.current === focusKey) return
    prevFocusKeyRef.current = focusKey
    clearAmountRoll()
  }, [focusKey])

  useEffect(() => {
    if (isKeypad) return
    internalAmountInputRef.current?.focus()
  }, [focusKey, isKeypad])

  const rootClassName = [
    styles.column,
    isKeypad && styles.columnKeypad,
    isKeypadMobile && styles.columnKeypadMobile,
    columnClassName,
  ]
    .filter(Boolean)
    .join(' ')
  const headingClassName = [styles.title, titleClassName].filter(Boolean).join(' ')
  const cardTitleClassName = ['armada-text-ui-body-lg', styles.cardTitle].join(' ')
  const showCardTitle = !hideTitle
  const cardTitle = showCardTitle ? (
    <h1 className={cardTitleClassName}>{title}</h1>
  ) : null
  const amountDescribedBy = [
    exceedsBalance ? amountErrorId : null,
    showFeeCaption && showFeeRow ? feeCaptionId : null,
  ]
    .filter(Boolean)
    .join(' ')

  const amountBlock = (
    <AmountExceededWarning id={amountErrorId} visible={exceedsBalance} message={exceedMessage}>
      <div className={styles.amountStack}>
        <div className={styles.amountGroup}>
          <div className={styles.amountField}>
            {isKeypad ? (
              <p
                ref={amountDisplayRef}
                id={amountDisplayId}
                tabIndex={-1}
                className={[
                  styles.amountDisplay,
                  !hasAmount && styles.amountEmpty,
                  exceedsBalance && styles.amountInputError,
                  isAmountRolling && styles.amountValueHidden,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-live="polite"
                aria-atomic="true"
                aria-label={amountAriaLabel}
                aria-invalid={exceedsBalance || undefined}
                aria-describedby={amountDescribedBy || undefined}
              >
                {displayAmount || '0'}
              </p>
            ) : (
              <input
                ref={setAmountInputRef}
                id={amountInputId}
                className={[
                  styles.amountInput,
                  !hasAmount && styles.amountEmpty,
                  exceedsBalance && styles.amountInputError,
                  isAmountRolling && styles.amountValueHidden,
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={displayAmount}
                onChange={(event) => handleAmountChange(event.target.value)}
                aria-label={amountAriaLabel}
                aria-invalid={exceedsBalance || undefined}
                aria-describedby={amountDescribedBy || undefined}
                size={Math.max(1, displayAmount.length || 1)}
                readOnly={isAmountRolling}
              />
            )}
            {isAmountRolling && amountRoll ? (
              <span className={styles.amountRollLayer} aria-hidden>
                <RollingBalanceValue
                  key={amountRoll.trigger}
                  value={amountRoll.toValue}
                  fromValue={amountRoll.fromValue}
                  mode="fromValue"
                  rollTrigger={amountRoll.trigger}
                  rollStartMs={0}
                />
              </span>
            ) : null}
          </div>
        </div>
        {showFeeCaption ? (
          <p
            id={feeCaptionId}
            className={`armada-text-ui-label-md ${styles.feeCaption}`}
            role="status"
            aria-live="polite"
          >
            {showFeeRow ? feeCaption : '\u00a0'}
          </p>
        ) : null}
      </div>
    </AmountExceededWarning>
  )

  const shieldTabs = (
    <SegmentedControl
      size="sm"
      aria-label="Shield or unshield"
      value={shieldDirection ?? 'shield'}
      onChange={(next) => onShieldDirectionChange?.(next)}
      options={[
        { id: 'shield', label: 'Shield' },
        { id: 'unshield', label: 'Unshield' },
      ]}
    />
  )

  const balanceControls = (
    <div className={styles.cardFooter}>
      <div className={styles.bottomRow}>
        <div className={styles.walletBalance}>
          <WalletIcon
            className={[styles.walletIcon, exceedsBalance && styles.walletIconError]
              .filter(Boolean)
              .join(' ')}
            aria-hidden
          />
          <span
            className={[styles.balanceText, exceedsBalance && styles.balanceTextError]
              .filter(Boolean)
              .join(' ')}
          >
            {balanceDisplay}
          </span>
        </div>
        <div className={styles.pctPills}>
          <button type="button" className={[styles.pctPill, iconButtonStyles.frostedFill].join(' ')} onClick={() => applyPercent(0.25)}>
            25%
          </button>
          <button type="button" className={[styles.pctPill, iconButtonStyles.frostedFill].join(' ')} onClick={() => applyPercent(0.5)}>
            50%
          </button>
          <button type="button" className={[styles.pctPill, iconButtonStyles.frostedFill].join(' ')} onClick={() => applyPercent(0.75)}>
            75%
          </button>
          <button type="button" className={[styles.pctPill, iconButtonStyles.frostedFill].join(' ')} onClick={handleMax}>
            Max
          </button>
        </div>
      </div>
    </div>
  )

  const actionRow = isKeypadMobile ? (
    <div className={`${styles.buttonRow} ${styles.buttonRowSingle} ${styles.keypadEnterCta}`}>
      <Button
        variant="primary"
        size="lg"
        label={primaryLabel}
        showIcon={false}
        disabled={!canReview}
        dimWhenDisabled={false}
        onDisabledClick={handleIncompleteCta}
        onClick={onReview}
      />
    </div>
  ) : (
    <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
      <Button
        variant="secondary"
        size="lg"
        label={secondaryAction.label}
        showIcon={false}
        className={styles.cancelButton}
        onClick={secondaryAction.onClick}
      />
      <Button
        variant="primary"
        size="lg"
        label={primaryLabel}
        showIcon={false}
        disabled={!canReview}
        dimWhenDisabled={false}
        className={styles.confirmButton}
        onDisabledClick={handleIncompleteCta}
        onClick={onReview}
      />
    </div>
  )

  if (isKeypad) {
    return (
      <div className={rootClassName}>
        <div
          className={[styles.keypadBody, !isKeypadMobile && modalStepBodyEnter]
            .filter(Boolean)
            .join(' ')}
        >
          {headerSlot && !isShieldLayout ? headerSlot : null}
          {introSlot}
          {isShieldLayout || hideTitle || isKeypadMobile ? null : (
            <h1 className={headingClassName}>{title}</h1>
          )}
          {isKeypadMobile ? (
            <>
              <div className={`${styles.keypadAmountCenter} ${styles.keypadEnterAmount}`}>
                <div
                  className={shaking ? nudgeStyles.shake : undefined}
                  onAnimationEnd={onShakeAnimationEnd}
                >
                  {amountBlock}
                </div>
              </div>
              {footerSlot}
              {showBalanceControls ? (
                <div className={`${styles.keypadBalanceRow} ${styles.keypadEnterBalance}`}>
                  {balanceControls}
                </div>
              ) : null}
              <div className={`${styles.keypadDock} ${styles.keypadEnterKeypad}`}>
                <NumericKeypad className={styles.keypadPad} fullWidth onKey={handleKeypadKey} />
              </div>
            </>
          ) : (
            <>
              <div
                className={[styles.keypadAmountBlock, shaking && nudgeStyles.shake]
                  .filter(Boolean)
                  .join(' ')}
                onAnimationEnd={onShakeAnimationEnd}
              >
                {amountBlock}
                {showBalanceControls ? balanceControls : null}
              </div>
              {footerSlot}
              <NumericKeypad className={styles.keypadPad} onKey={handleKeypadKey} />
            </>
          )}
        </div>
        <div className={styles.keypadActions}>{actionRow}</div>
      </div>
    )
  }

  return (
    <div className={rootClassName}>
      <div className={modalStepBodyEnter}>
        {introSlot}

        <div
          className={[styles.card, shaking && nudgeStyles.shake].filter(Boolean).join(' ')}
          onAnimationEnd={onShakeAnimationEnd}
        >
          <div className={styles.cardTop}>
            {isShieldLayout ? shieldTabs : headerSlot}
            {cardTitle}
            {amountBlock}
          </div>
          {showBalanceControls ? balanceControls : null}
        </div>

        {footerSlot}
      </div>

      {actionRow}
    </div>
  )
}
