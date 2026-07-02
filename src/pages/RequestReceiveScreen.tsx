import { useEffect, useId, useRef, useState } from 'react'
import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import balanceCardStyles from '@/components/BalanceCard/BalanceCard.module.css'
import { Button } from '@/components/Button'
import { IconButton } from '@/components/IconButton'
import { modalStepBodyEnter } from '@/components/ModalShell'
import walletPanelStyles from '@/components/WalletMenuPanel/WalletMenuPanel.module.css'
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
  note: string
  expiryId: RequestLinkExpiryId
  onAmountChange: (amount: string) => void
  onNoteChange: (note: string) => void
  onExpiryChange: (expiryId: RequestLinkExpiryId) => void
  onCreateLink: () => void
}

export function RequestReceiveScreen({
  privateAddress,
  amount,
  note,
  expiryId,
  onAmountChange,
  onNoteChange,
  onExpiryChange,
  onCreateLink,
}: RequestReceiveScreenProps) {
  const amountInputId = useId()
  const noteInputId = useId()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const [addressCopied, setAddressCopied] = useState(false)
  const addressCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canCreateLink = hasActiveAmount(amount)
  const ctaLabel = canCreateLink ? 'Create link' : 'Input amount'
  const noteLength = note.length
  const expiryIndex = Math.max(
    0,
    REQUEST_LINK_EXPIRY_OPTIONS.findIndex((option) => option.id === expiryId),
  )

  function handleAmountChange(raw: string) {
    const next = sanitizeAmountInput(raw)
    onAmountChange(hasActiveAmount(next) ? next : '')
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
    amountInputRef.current?.focus()
    return () => {
      if (addressCopyTimerRef.current) clearTimeout(addressCopyTimerRef.current)
    }
  }, [])

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={styles.title}>Request funds via link</h1>

        <div className={styles.linkCard}>
          <div className={styles.amountRow}>
            <div className={styles.amountGroup}>
            <div className={styles.tokenBadge} aria-hidden>
              <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
            </div>
            <div className={styles.amountField}>
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
              />
            </div>
          </div>
          </div>

          <div className={[styles.fieldBlock, styles.noteFieldBlock].join(' ')}>
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

          <div className={[styles.fieldBlock, styles.expiryFieldBlock].join(' ')}>
            <p className={styles.fieldLabel}>Link expires</p>
            <div className={styles.expiryTabs} role="tablist" aria-label="Link expiry">
              <span
                className={styles.expiryTabIndicator}
                style={{ transform: `translateX(${expiryIndex * 100}%)` }}
                aria-hidden
              />
              {REQUEST_LINK_EXPIRY_OPTIONS.map((option) => {
                const isActive = expiryId === option.id

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={[styles.expiryTab, isActive && styles.expiryTabActive].filter(Boolean).join(' ')}
                    onClick={() => onExpiryChange(option.id)}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            label={ctaLabel}
            showIcon={false}
            className={styles.createLinkButton}
            disabled={!canCreateLink}
            dimWhenDisabled={false}
            onClick={onCreateLink}
          />
        </div>

        <p className={styles.divider}>Or use your private address</p>

        <div className={styles.addressCard}>
          <div className={styles.addressRow}>
            <div className={styles.addressText}>
              <p className={styles.sectionLabel}>Your private address</p>
              <p className={[walletPanelStyles.ethereumWalletAddress, styles.addressValue].join(' ')}>
                {truncateArmadaAddress(privateAddress)}
              </p>
            </div>
            <IconButton
              variant="secondary"
              icon={
                addressCopied ? (
                  <CheckIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} aria-hidden />
                ) : (
                  <ClipboardDocumentIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} />
                )
              }
              aria-label={addressCopied ? 'Address copied' : 'Copy private address'}
              onClick={() => void handleCopyAddress()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { DEFAULT_REQUEST_LINK_EXPIRY_ID }
