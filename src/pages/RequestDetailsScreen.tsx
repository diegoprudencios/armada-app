import { useId } from 'react'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { formatAmountInputDisplay, hasActiveAmount } from '@/utils/amountInput'
import {
  REQUEST_LINK_EXPIRY_OPTIONS,
  REQUEST_NOTE_MAX_LENGTH,
  type RequestLinkExpiryId,
} from './requestFlowConstants'
import receiveStyles from './RequestReceiveScreen.module.css'
import styles from './RequestDetailsScreen.module.css'

const TOKEN_BADGE_PX = 40
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface RequestDetailsScreenProps {
  amount: string
  note: string
  expiryId: RequestLinkExpiryId
  /** Mobile keypad: single sticky CTA; back lives in modal chrome. */
  keypadMobileLayout?: boolean
  onNoteChange: (note: string) => void
  onExpiryChange: (expiryId: RequestLinkExpiryId) => void
  onBack: () => void
  onCreateLink: () => void
}

export function RequestDetailsScreen({
  amount,
  note,
  expiryId,
  keypadMobileLayout = false,
  onNoteChange,
  onExpiryChange,
  onBack,
  onCreateLink,
}: RequestDetailsScreenProps) {
  const noteInputId = useId()
  const displayAmount = formatAmountInputDisplay(amount)
  const canCreateLink = hasActiveAmount(amount)
  const noteLength = note.length
  const expiryIndex = Math.max(
    0,
    REQUEST_LINK_EXPIRY_OPTIONS.findIndex((option) => option.id === expiryId),
  )

  const fields = (
    <>
      <div className={styles.fieldBlock}>
        <p className={receiveStyles.fieldLabel}>Link expires</p>
        <div className={receiveStyles.expiryTabs} role="tablist" aria-label="Link expiry">
          <span
            className={receiveStyles.expiryTabIndicator}
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
                className={[receiveStyles.expiryTab, isActive && receiveStyles.expiryTabActive]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onExpiryChange(option.id)}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.fieldBlock}>
        <label className={receiveStyles.fieldLabel} htmlFor={noteInputId}>
          Note <span className={receiveStyles.fieldOptional}>(optional)</span>
        </label>
        <textarea
          id={noteInputId}
          className={[receiveStyles.noteInput, keypadMobileLayout && styles.noteInputTall]
            .filter(Boolean)
            .join(' ')}
          value={note}
          maxLength={REQUEST_NOTE_MAX_LENGTH}
          placeholder="For invoice #123"
          rows={keypadMobileLayout ? 4 : 2}
          onChange={(event) => onNoteChange(event.target.value)}
        />
        <p className={receiveStyles.noteMeta}>
          {noteLength}/{REQUEST_NOTE_MAX_LENGTH}
        </p>
      </div>
    </>
  )

  if (keypadMobileLayout) {
    return (
      <div className={styles.columnKeypad}>
        <div className={styles.amountBlock} aria-live="polite">
          <div className={styles.amountGroup}>
            <div className={styles.tokenBadge} aria-hidden>
              <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
            </div>
            <span className={styles.amountValue}>{displayAmount || '0'}</span>
          </div>
        </div>

        <div className={styles.bottomStack}>
          <div className={styles.fields}>{fields}</div>
          <div className={`${styles.ctaDock} ${modalActionRowEnter}`}>
            <Button
              variant="primary"
              size="lg"
              label="Create link"
              showIcon={false}
              disabled={!canCreateLink}
              dimWhenDisabled={false}
              onClick={onCreateLink}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={receiveStyles.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={receiveStyles.title}>Request details</h1>
        <div className={receiveStyles.linkCard}>
          {fields}
        </div>
      </div>
      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        <Button variant="secondary" size="lg" label="Back" showIcon={false} onClick={onBack} />
        <Button
          variant="primary"
          size="lg"
          label="Create link"
          showIcon={false}
          disabled={!canCreateLink}
          dimWhenDisabled={false}
          onClick={onCreateLink}
        />
      </div>
    </div>
  )
}
