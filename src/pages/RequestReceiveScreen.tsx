import { useEffect, useId, useRef, useState } from 'react'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { modalStepBodyEnter } from '@/components/ModalShell'
import { hasActiveAmount, sanitizeAmountInput } from '@/utils/amountInput'
import { truncateArmadaAddress } from '@/utils/format'
import {
  DEFAULT_REQUEST_LINK_EXPIRY_ID,
  REQUEST_LINK_EXPIRY_OPTIONS,
  REQUEST_NOTE_MAX_LENGTH,
  type RequestLinkExpiryId,
} from './requestFlowConstants'
import styles from './RequestReceiveScreen.module.css'

const TOKEN_BADGE_PX = 40
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface RequestReceiveScreenProps {
  privateAddress: string
  amount: string
  anyAmount: boolean
  note: string
  expiryId: RequestLinkExpiryId
  onAmountChange: (amount: string) => void
  onAnyAmountChange: (anyAmount: boolean) => void
  onNoteChange: (note: string) => void
  onExpiryChange: (expiryId: RequestLinkExpiryId) => void
  onCreateLink: () => void
}

export function RequestReceiveScreen({
  privateAddress,
  amount,
  anyAmount,
  note,
  expiryId,
  onAmountChange,
  onAnyAmountChange,
  onNoteChange,
  onExpiryChange,
  onCreateLink,
}: RequestReceiveScreenProps) {
  const amountInputId = useId()
  const noteInputId = useId()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const [addressCopied, setAddressCopied] = useState(false)
  const addressCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canCreateLink = anyAmount || hasActiveAmount(amount)
  const noteLength = note.length

  function handleAmountChange(raw: string) {
    const next = sanitizeAmountInput(raw)
    onAmountChange(hasActiveAmount(next) ? next : '')
  }

  function handleAnyAmountToggle() {
    const next = !anyAmount
    onAnyAmountChange(next)
    if (next) {
      onAmountChange('')
    } else {
      amountInputRef.current?.focus()
    }
  }

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(privateAddress)
      setAddressCopied(true)
      if (addressCopyTimerRef.current) clearTimeout(addressCopyTimerRef.current)
      addressCopyTimerRef.current = setTimeout(() => setAddressCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  useEffect(() => {
    if (!anyAmount) {
      amountInputRef.current?.focus()
    }
    return () => {
      if (addressCopyTimerRef.current) clearTimeout(addressCopyTimerRef.current)
    }
  }, [anyAmount])

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={styles.title}>Receive funds</h1>

        <div className={styles.addressCard}>
          <p className={styles.sectionLabel}>Your private address</p>
          <div className={styles.addressRow}>
            <p className={styles.addressValue}>{truncateArmadaAddress(privateAddress)}</p>
            <button type="button" className={styles.copyButton} onClick={() => void handleCopyAddress()}>
              {addressCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <p className={styles.divider}>Or request via link</p>

        <div className={styles.linkCard}>
          <div className={styles.amountGroup}>
            <div className={styles.tokenBadge} aria-hidden>
              <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
            </div>
            <div className={styles.amountField}>
              {anyAmount ? (
                <span className={styles.anyAmountLabel}>Any amount</span>
              ) : (
                <input
                  ref={amountInputRef}
                  id={amountInputId}
                  className={styles.amountInput}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  aria-label="Requested amount in USDC"
                  size={Math.max(1, amount.length || 1)}
                />
              )}
            </div>
          </div>

          <div className={styles.amountOptions}>
            <button
              type="button"
              className={[styles.optionPill, anyAmount && styles.optionPillActive].filter(Boolean).join(' ')}
              aria-pressed={anyAmount}
              onClick={handleAnyAmountToggle}
            >
              Any amount
            </button>
          </div>

          <div className={styles.fieldBlock}>
            <label className={styles.fieldLabel} htmlFor={noteInputId}>
              Note <span className={styles.fieldOptional}>(optional)</span>
            </label>
            <textarea
              id={noteInputId}
              className={styles.noteInput}
              value={note}
              maxLength={REQUEST_NOTE_MAX_LENGTH}
              placeholder="For invoice #123"
              rows={2}
              onChange={(event) => onNoteChange(event.target.value)}
            />
            <p className={styles.noteMeta}>
              {noteLength}/{REQUEST_NOTE_MAX_LENGTH}
            </p>
          </div>

          <div className={styles.fieldBlock}>
            <p className={styles.fieldLabel}>Link expires</p>
            <div className={styles.expiryPills} role="group" aria-label="Link expiry">
              {REQUEST_LINK_EXPIRY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={[
                    styles.optionPill,
                    expiryId === option.id && styles.optionPillActive,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={expiryId === option.id}
                  onClick={() => onExpiryChange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            label="Create link"
            showIcon={false}
            className={styles.createLinkButton}
            disabled={!canCreateLink}
            dimWhenDisabled={false}
            onClick={onCreateLink}
          />
        </div>
      </div>
    </div>
  )
}

export { DEFAULT_REQUEST_LINK_EXPIRY_ID }
