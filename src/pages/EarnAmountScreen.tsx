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
import {
  DEMO_EARN_APY,
  EARN_TABS,
  earnAmountQuestion,
  formatDemoApy,
  type EarnTab,
} from './earnFlowConstants'
import flowStep from '@/styles/modalFlowStep.module.css'
import styles from './EarnAmountScreen.module.css'

const TOKEN_BADGE_PX = 40
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface EarnAmountScreenProps {
  tab: EarnTab
  balance: number
  amount: string
  apy?: number
  onTabChange: (tab: EarnTab) => void
  onAmountChange: (amount: string) => void
  onCancel: () => void
  onReview: (amount: string) => void
}

export function EarnAmountScreen({
  tab,
  balance,
  amount,
  apy = DEMO_EARN_APY,
  onTabChange,
  onAmountChange,
  onCancel,
  onReview,
}: EarnAmountScreenProps) {
  const amountInputId = useId()
  const amountErrorId = useId()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const balanceDisplay = formatWalletBalance(balance)
  const balanceInputValue = balanceDisplay.replace(/,/g, '')
  const hasAmount = hasActiveAmount(amount)
  const exceedsBalance = amountExceedsBalance(amount, balance)
  const canReview = hasAmount && !exceedsBalance
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

  function handleTabChange(next: EarnTab) {
    if (next === tab) return
    onTabChange(next)
    onAmountChange('')
  }

  useEffect(() => {
    amountInputRef.current?.focus()
  }, [tab])

  return (
    <div className={flowStep.column}>
      <div className={modalStepBodyEnter}>
        <div className={styles.tabs} role="tablist" aria-label="Earn mode">
          {EARN_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={[styles.tab, tab === item.id && styles.tabActive].filter(Boolean).join(' ')}
              onClick={() => handleTabChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <h1 className={flowStep.title}>{earnAmountQuestion(tab)}</h1>

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
                  aria-label={tab === 'add' ? 'Vault deposit amount' : 'Vault withdrawal amount'}
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

        {tab === 'add' ? (
          <div className={styles.apyBlock}>
            <span className={styles.apyLabel}>Estimated APY</span>
            <span className={styles.apyValue}>{formatDemoApy(apy)}</span>
            <p className={styles.apyCaveat}>
              Based on the vault&apos;s recent rate; the actual yield earned will vary.
            </p>
          </div>
        ) : null}
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        <Button variant="secondary" size="lg" label="Cancel" showIcon={false} onClick={onCancel} />
        <Button
          variant="primary"
          size="lg"
          label="Review"
          showIcon={false}
          disabled={!canReview}
          dimWhenDisabled={false}
          onClick={() => onReview(amount)}
        />
      </div>
    </div>
  )
}
