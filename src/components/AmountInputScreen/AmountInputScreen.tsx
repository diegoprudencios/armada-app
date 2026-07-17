import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from 'react'
import { WalletIcon } from '@heroicons/react/24/solid'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { AmountExceededWarning } from '@/components/AmountExceededWarning'
import { NumericKeypad, type NumericKeypadKey } from '@/components/NumericKeypad'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { useMobileLayout } from '@/hooks/useMobileLayout'
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
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import styles from './AmountInputScreen.module.css'

const TOKEN_BADGE_PX = 40
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export type AmountInputBalanceMode = 'simple' | 'deposit-fee-aware'
export type AmountInputPrimaryLabelMode = 'dynamic' | 'static'
/** `input` = system keyboard (default). `keypad` = on-screen numeric pad. */
export type AmountInputEntryMode = 'input' | 'keypad'

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
  entryMode?: AmountInputEntryMode
  headerSlot?: ReactNode
  footerSlot?: ReactNode
  /** Re-focus amount input when this value changes (e.g. Earn tab). */
  focusKey?: unknown
  /** Optional ref for modal initial focus on open (input mode only). */
  amountInputRef?: Ref<HTMLInputElement>
  columnClassName?: string
  titleClassName?: string
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
  entryMode = 'input',
  headerSlot,
  footerSlot,
  focusKey,
  amountInputRef: amountInputRefProp,
  columnClassName,
  titleClassName,
}: AmountInputScreenProps) {
  const isMobile = useMobileLayout()
  const amountInputId = useId()
  const amountErrorId = useId()
  const amountDisplayId = useId()
  const internalAmountInputRef = useRef<HTMLInputElement | null>(null)
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
  const exceedsBalance = resolveExceedsBalance(amount, balance, balanceMode)
  const canReview = hasAmount && !exceedsBalance
  const primaryLabel =
    primaryLabelMode === 'static' ? 'Review' : hasAmount ? 'Review' : 'Input amount'
  const feeUsdc = calculateFee(parseActiveAmount(amount))
  const feeLabel = formatProtocolFeeLabel(feeUsdc)
  const showFeeRow = hasAmount && feeUsdc > 0
  const maxAmount = resolveMaxAmount(balance, balanceMode)
  const displayAmount = formatAmountInputDisplay(amount)

  function handleAmountChange(raw: string) {
    commitAmount(sanitizeAmountInput(raw), onAmountChange)
  }

  function handleKeypadKey(key: NumericKeypadKey) {
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
    onAmountChange(formatAmountInputValue(maxAmount * percent))
  }

  function handleMax() {
    onAmountChange(formatAmountInputValue(maxAmount))
  }

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

  const amountBlock = (
    <AmountExceededWarning id={amountErrorId} visible={exceedsBalance} message={exceedMessage}>
      <div className={styles.amountGroup}>
        <div className={styles.tokenBadge} aria-hidden>
          <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
        </div>
        <div className={styles.amountField}>
          {isKeypad ? (
            <p
              id={amountDisplayId}
              className={[styles.amountDisplay, exceedsBalance && styles.amountInputError]
                .filter(Boolean)
                .join(' ')}
              aria-live="polite"
              aria-atomic="true"
              aria-label={amountAriaLabel}
              aria-invalid={exceedsBalance || undefined}
              aria-describedby={exceedsBalance ? amountErrorId : undefined}
            >
              {displayAmount || '0'}
            </p>
          ) : (
            <input
              ref={setAmountInputRef}
              id={amountInputId}
              className={[styles.amountInput, exceedsBalance && styles.amountInputError]
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
              aria-describedby={exceedsBalance ? amountErrorId : undefined}
              size={Math.max(1, displayAmount.length || 1)}
            />
          )}
        </div>
      </div>
    </AmountExceededWarning>
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
          <button type="button" className={styles.pctPill} onClick={() => applyPercent(0.25)}>
            25%
          </button>
          <button type="button" className={styles.pctPill} onClick={() => applyPercent(0.5)}>
            50%
          </button>
          <button type="button" className={styles.pctPill} onClick={() => applyPercent(0.75)}>
            75%
          </button>
          <button type="button" className={styles.pctPill} onClick={handleMax}>
            Max
          </button>
        </div>
      </div>

      <div
        className={[styles.feeReveal, showFeeRow && styles.feeRevealOpen].filter(Boolean).join(' ')}
        aria-hidden={!showFeeRow}
      >
        <div className={styles.feeRow}>
          <span className={styles.feeLabel}>Fee</span>
          <span className={styles.feeValue}>{feeLabel}</span>
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
        onClick={secondaryAction.onClick}
      />
      <Button
        variant="primary"
        size="lg"
        label={primaryLabel}
        showIcon={false}
        disabled={!canReview}
        dimWhenDisabled={false}
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
          {headerSlot}
          {isKeypadMobile ? null : <h1 className={headingClassName}>{title}</h1>}
          {isKeypadMobile ? (
            <>
              <div className={`${styles.keypadAmountCenter} ${styles.keypadEnterAmount}`}>
                {amountBlock}
              </div>
              {footerSlot}
              <div className={`${styles.keypadBalanceRow} ${styles.keypadEnterBalance}`}>
                {balanceControls}
              </div>
              <div className={`${styles.keypadDock} ${styles.keypadEnterKeypad}`}>
                <NumericKeypad className={styles.keypadPad} fullWidth onKey={handleKeypadKey} />
              </div>
            </>
          ) : (
            <>
              <div className={styles.keypadAmountBlock}>
                {amountBlock}
                {balanceControls}
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
        {headerSlot}
        <h1 className={headingClassName}>{title}</h1>

        <div className={styles.card}>
          {amountBlock}
          {balanceControls}
        </div>

        {footerSlot}
      </div>

      {actionRow}
    </div>
  )
}
