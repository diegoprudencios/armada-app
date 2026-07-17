import { useEffect, useId, useRef } from 'react'
import { WalletIcon } from '@heroicons/react/24/solid'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { AmountExceededWarning } from '@/components/AmountExceededWarning'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { hasActiveAmount, amountExceedsBalance, parseActiveAmount, sanitizeAmountInput } from '@/utils/amountInput'
import { formatProtocolFeeLabel } from '@/utils/protocolFee'
import { calculateSendFee } from '@/utils/sendFee'
import { formatUsdcAmount, formatWalletBalance } from '@/utils/format'
import { AMOUNT_EXCEEDS_BALANCE_MESSAGE } from '@/utils/amountFieldA11y'
import styles from './SendAmountScreen.module.css'

const TOKEN_BADGE_PX = 40
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface SendAmountScreenProps {
  balance: number
  amount: string
  onAmountChange: (amount: string) => void
  onBack: () => void
  onReview: (amount: string) => void
}

export function SendAmountScreen({
  balance,
  amount,
  onAmountChange,
  onBack,
  onReview,
}: SendAmountScreenProps) {
  const amountInputId = useId()
  const amountErrorId = useId()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const balanceDisplay = formatWalletBalance(balance)
  const balanceInputValue = balanceDisplay.replace(/,/g, '')
  const hasAmount = hasActiveAmount(amount)
  const exceedsBalance = amountExceedsBalance(amount, balance)
  const canReview = hasAmount && !exceedsBalance
  const reviewLabel = hasAmount ? 'Review' : 'Input amount'
  const feeUsdc = calculateSendFee(parseActiveAmount(amount))
  const feeLabel = formatProtocolFeeLabel(feeUsdc)
  const showFeeRow = hasAmount && feeUsdc > 0

  function handleAmountChange(raw: string) {
    const next = sanitizeAmountInput(raw)
    onAmountChange(hasActiveAmount(next) ? next : '')
  }

  function applyPercent(percent: number) {
    const next = balance * percent
    onAmountChange(formatWalletBalance(next).replace(/,/g, ''))
  }

  function handleMax() {
    onAmountChange(balanceInputValue)
  }

  useEffect(() => {
    amountInputRef.current?.focus()
  }, [])

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={styles.title}>How much USDC?</h1>

        <div className={styles.card}>
          <AmountExceededWarning
            id={amountErrorId}
            visible={exceedsBalance}
            message={AMOUNT_EXCEEDS_BALANCE_MESSAGE}
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
                  aria-label="Send amount"
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
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        <Button variant="secondary" size="lg" label="Back" showIcon={false} onClick={onBack} />
        <Button
          variant="primary"
          size="lg"
          label={reviewLabel}
          showIcon={false}
          disabled={!canReview}
          dimWhenDisabled={false}
          onClick={() => onReview(amount)}
        />
      </div>
    </div>
  )
}
