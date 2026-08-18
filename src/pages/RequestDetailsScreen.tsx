import { useId } from 'react'
import { Button } from '@/components/Button'
import { SegmentedControl } from '@/components/SegmentedControl'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { hasActiveAmount } from '@/utils/amountInput'
import {
  REQUEST_LINK_EXPIRY_OPTIONS,
  REQUEST_NOTE_MAX_LENGTH,
  type RequestLinkExpiryId,
} from './requestFlowConstants'
import receiveStyles from './RequestReceiveScreen.module.css'
import styles from './RequestDetailsScreen.module.css'

export interface RequestDetailsScreenProps {
  amount: string
  note: string
  expiryId: RequestLinkExpiryId
  /** Mobile keypad: compact content for a bottom sheet over the amount screen. */
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
  const canCreateLink = hasActiveAmount(amount)
  const noteLength = note.length

  const fields = (
    <>
      <div className={styles.fieldBlock}>
        <p className={receiveStyles.fieldLabel}>Link expires</p>
        <SegmentedControl
          size="md"
          aria-label="Link expiry"
          value={expiryId}
          onChange={onExpiryChange}
          options={REQUEST_LINK_EXPIRY_OPTIONS}
        />
      </div>

      <div className={styles.fieldBlock}>
        <label className={receiveStyles.fieldLabel} htmlFor={noteInputId}>
          Note <span className={receiveStyles.fieldOptional}>(optional)</span>
        </label>
        <textarea
          id={noteInputId}
          className={[
            receiveStyles.noteInput,
            keypadMobileLayout && styles.noteInputOnSheet,
          ]
            .filter(Boolean)
            .join(' ')}
          value={note}
          maxLength={REQUEST_NOTE_MAX_LENGTH}
          placeholder="For invoice #123"
          rows={2}
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
      <div className={styles.sheetColumn}>
        <div className={styles.fields}>{fields}</div>
        <div className={styles.sheetActions}>
          <Button
            variant="primary"
            size="lg"
            label="Create link"
            showIcon={false}
            disabled={!canCreateLink}
            dimWhenDisabled={false}
            onClick={onCreateLink}
            testingClickId="request_create_link_button"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={receiveStyles.column}>
      <div className={modalStepBodyEnter}>
        <div className={receiveStyles.linkCard}>
          <h1 className={`armada-text-ui-body-lg ${receiveStyles.cardTitle}`}>Request details</h1>
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
          testingClickId="request_create_link_button"
        />
      </div>
    </div>
  )
}
