import { useEffect, useId, useRef, type ReactNode } from 'react'
import { WalletIcon } from '@heroicons/react/24/solid'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { AmountExceededWarning } from '@/components/AmountExceededWarning'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import {
  amountExceedsBalance,
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
  headerSlot?: ReactNode
  footerSlot?: ReactNode
  /** Re-focus amount input when this value changes (e.g. Earn tab). */
  focusKey?: unknown
  columnClassName?: string
  titleClassName?: string
}

function formatAmountInputValue(value: number): string {
  return formatWalletBalance(value).replace(/,/g, '')
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
  headerSlot,
  footerSlot,
  focusKey,
  columnClassName,
  titleClassName,
}: AmountInputScreenProps) {
  const amountInputId = useId()
  const amountErrorId = useId()
  const amountInputRef = useRef<HTMLInputElement>(null)
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

  function handleAmountChange(raw: string) {
    const next = sanitizeAmountInput(raw)
    onAmountChange(hasActiveAmount(next) ? next : '')
  }

  function applyPercent(percent: number) {
    onAmountChange(formatAmountInputValue(maxAmount * percent))
  }

  function handleMax() {
    onAmountChange(formatAmountInputValue(maxAmount))
  }

  useEffect(() => {
    amountInputRef.current?.focus()
  }, [focusKey])

  const rootClassName = [styles.column, columnClassName].filter(Boolean).join(' ')
  const headingClassName = [styles.title, titleClassName].filter(Boolean).join(' ')

  return (
    <div className={rootClassName}>
      <div className={modalStepBodyEnter}>
        {headerSlot}
        <h1 className={headingClassName}>{title}</h1>

        <div className={styles.card}>
          <AmountExceededWarning
            id={amountErrorId}
            visible={exceedsBalance}
            message={exceedMessage}
          >
            <div className={styles.amountGroup}>
              <div className={styles.tokenBadge} aria-hidden>
                <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
              </div>
              <div className={styles.amountField}>
                <input
                  ref={amountInputRef}
                  id={amountInputId}
                  className={[styles.amountInput, exceedsBalance && styles.amountInputError]
                    .filter(Boolean)
                    .join(' ')}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  aria-label={amountAriaLabel}
                  aria-invalid={exceedsBalance || undefined}
                  aria-describedby={exceedsBalance ? amountErrorId : undefined}
                  size={Math.max(1, amount.length || 1)}
                />
              </div>
            </div>
          </AmountExceededWarning>

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
        </div>

        {footerSlot}
      </div>

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
    </div>
  )
}
