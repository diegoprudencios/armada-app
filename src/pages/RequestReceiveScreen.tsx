import { useCallback, useId, useRef, type MutableRefObject, type Ref } from 'react'
import { useNudgeShake } from '@/hooks/useNudgeShake'
import nudgeStyles from '@/styles/incompleteCtaNudge.module.css'
import { Button } from '@/components/Button'
import { SegmentedControl } from '@/components/SegmentedControl'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { formatAmountInputDisplay, hasActiveAmount, sanitizeAmountInput } from '@/utils/amountInput'
import {
  DEFAULT_REQUEST_LINK_EXPIRY_ID,
  REQUEST_LINK_EXPIRY_OPTIONS,
  REQUEST_NOTE_MAX_LENGTH,
  type RequestLinkExpiryId,
} from './requestFlowConstants'
import styles from './RequestReceiveScreen.module.css'

export interface RequestReceiveScreenProps {
  amount: string
  note: string
  expiryId: RequestLinkExpiryId
  amountInputRef?: Ref<HTMLInputElement>
  onAmountChange: (amount: string) => void
  onNoteChange: (note: string) => void
  onExpiryChange: (expiryId: RequestLinkExpiryId) => void
  onCancel: () => void
  onCreateLink: () => void
}

export function RequestReceiveScreen({
  amount,
  note,
  expiryId,
  amountInputRef: amountInputRefProp,
  onAmountChange,
  onNoteChange,
  onExpiryChange,
  onCancel,
  onCreateLink,
}: RequestReceiveScreenProps) {
  const amountInputId = useId()
  const noteInputId = useId()
  const internalAmountInputRef = useRef<HTMLInputElement | null>(null)
  const { shaking, nudge, onShakeAnimationEnd } = useNudgeShake()

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

  const displayAmount = formatAmountInputDisplay(amount)
  const canCreateLink = hasActiveAmount(amount)
  const ctaLabel = canCreateLink ? 'Create link' : 'Input amount'
  const noteLength = note.length

  function handleAmountChange(raw: string) {
    const next = sanitizeAmountInput(raw)
    onAmountChange(hasActiveAmount(next) ? next : '')
  }

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
        <div
          className={[styles.linkCard, shaking && nudgeStyles.shake].filter(Boolean).join(' ')}
          onAnimationEnd={onShakeAnimationEnd}
        >
          <h1 className={`armada-text-ui-body-lg ${styles.cardTitle}`}>
            Request USDC via link
          </h1>

          <div className={styles.amountRow}>
            <div className={styles.amountGroup}>
            <div className={styles.amountField}>
              <input
                ref={setAmountInputRef}
                id={amountInputId}
                className={styles.amountInput}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={displayAmount}
                onChange={(event) => handleAmountChange(event.target.value)}
                aria-label="Requested amount in USDC"
                size={Math.max(1, displayAmount.length || 1)}
              />
            </div>
          </div>
          </div>

          <div className={[styles.fieldBlock, styles.expiryFieldBlock].join(' ')}>
            <p className={styles.fieldLabel}>Link expires</p>
            <SegmentedControl
              size="md"
              aria-label="Link expiry"
              value={expiryId}
              onChange={onExpiryChange}
              options={REQUEST_LINK_EXPIRY_OPTIONS}
            />
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
        </div>
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        <Button variant="secondary" size="lg" label="Cancel" showIcon={false} onClick={onCancel} />
        <Button
          variant="primary"
          size="lg"
          label={ctaLabel}
          showIcon={false}
          disabled={!canCreateLink}
          dimWhenDisabled={false}
          onDisabledClick={() => {
            nudge()
            internalAmountInputRef.current?.focus()
          }}
          onClick={onCreateLink}
          testingClickId="request_create_link_button"
        />
      </div>
    </div>
  )
}

export { DEFAULT_REQUEST_LINK_EXPIRY_ID }
