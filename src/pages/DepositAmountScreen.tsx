import { useEffect, useId, useRef } from 'react'
import { WalletIcon } from '@heroicons/react/24/solid'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import type { DepositChainId } from '@/components/DepositAmountCard'
import { Button } from '@/components/Button'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { hasActiveAmount, amountExceedsBalance, parseActiveAmount, sanitizeAmountInput } from '@/utils/amountInput'
import { calculateDepositFee } from '@/utils/depositFee'
import { formatUsdcAmount, formatWalletBalance } from '@/utils/format'
import styles from './DepositAmountScreen.module.css'

const TOKEN_BADGE_PX = 40
/** @web3icons branded assets use an 18px circle in a 24px viewBox — scale up to fill the badge. */
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface DepositAmountScreenProps {
  balance: number
  amount: string
  chain?: DepositChainId
  onAmountChange: (amount: string) => void
  onCancel: () => void
  onReview: (amount: string, chain: DepositChainId) => void
}

export function DepositAmountScreen({
  balance,
  amount,
  chain = 'sepolia',
  onAmountChange,
  onCancel,
  onReview,
}: DepositAmountScreenProps) {
  const amountInputId = useId()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const balanceStr = formatWalletBalance(balance).replace(/,/g, '')
  const showFee = hasActiveAmount(amount)
  const exceedsBalance = amountExceedsBalance(amount, balance)
  const canReview = showFee && !exceedsBalance
  const feeUsdc = calculateDepositFee(parseActiveAmount(amount))
  const feeLabel = `${formatUsdcAmount(feeUsdc, 2)} USDC`

  function handleAmountChange(raw: string) {
    const next = sanitizeAmountInput(raw)
    onAmountChange(hasActiveAmount(next) ? next : '')
  }

  function applyPercent(percent: number) {
    const next = balance * percent
    onAmountChange(formatWalletBalance(next).replace(/,/g, ''))
  }

  function handleMax() {
    onAmountChange(balanceStr)
  }

  useEffect(() => {
    amountInputRef.current?.focus()
  }, [])

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={styles.title}>How much do you want to deposit?</h1>

        <div className={styles.card}>
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
                aria-label="Deposit amount"
                aria-invalid={exceedsBalance}
                size={Math.max(1, amount.length || 1)}
              />
            </div>
          </div>

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
                  {balanceStr}
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
              className={[styles.feeReveal, showFee && styles.feeRevealOpen].filter(Boolean).join(' ')}
              aria-hidden={!showFee}
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
          <Button
            variant="secondary"
            size="lg"
            label="Cancel"
            showIcon={false}
            onClick={onCancel}
          />
          <Button
            variant="primary"
            size="lg"
            label="Review"
            showIcon={false}
            disabled={!canReview}
            className={styles.reviewBtn}
            onClick={() => onReview(amount, chain)}
          />
        </div>
    </div>
  )
}
