import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { PaymentLinkQrCode } from '@/components/PaymentLinkQrCode'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { formatUsdcAmount, truncateArmadaAddress } from '@/utils/format'
import { parseActiveAmount } from '@/utils/amountInput'
import { canUseNativeShare } from '@/utils/payViaLink'
import { formatPaymentLinkExpiry } from './requestFlowConstants'
import styles from './RequestLinkScreen.module.css'

export interface RequestLinkScreenProps {
  paymentLink: string
  routingAddress: string
  amount?: string
  note?: string
  expiresAt: number
  revoked: boolean
  onRevoke: () => void
  onDone: () => void
}

export function RequestLinkScreen({
  paymentLink,
  routingAddress,
  amount,
  note,
  expiresAt,
  revoked,
  onRevoke,
  onDone,
}: RequestLinkScreenProps) {
  const isMobile = useMobileLayout()
  const [linkCopied, setLinkCopied] = useState(false)
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false)
  const linkCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nativeShareAvailable = canUseNativeShare()
  const amountLabel = amount ? formatUsdcAmount(parseActiveAmount(amount)) : null
  const expiryLabel = formatPaymentLinkExpiry(expiresAt)

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(paymentLink)
      setLinkCopied(true)
      if (linkCopyTimerRef.current) clearTimeout(linkCopyTimerRef.current)
      linkCopyTimerRef.current = setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  async function handleShareLink() {
    const shareText = note?.trim()
      ? note.trim()
      : amountLabel
        ? `Pay ${amountLabel} USDC via Armada`
        : 'Pay via Armada'

    if (nativeShareAvailable) {
      try {
        await navigator.share({
          title: 'Armada payment request',
          text: shareText,
          url: paymentLink,
        })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    await handleCopyLink()
  }

  function handleRevokeConfirm() {
    onRevoke()
    setRevokeConfirmOpen(false)
  }

  useEffect(
    () => () => {
      if (linkCopyTimerRef.current) clearTimeout(linkCopyTimerRef.current)
    },
    [],
  )

  if (revoked) {
    return (
      <div className={styles.column}>
        <div className={modalStepBodyEnter}>
          <h1 className={styles.title}>Link revoked</h1>
          <p className={styles.body}>This payment link no longer works. Create a new one anytime.</p>
        </div>
        <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
          <Button variant="primary" size="lg" label="Done" showIcon={false} onClick={onDone} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={styles.title}>Share your link</h1>
        <p className={styles.body}>
          {amountLabel
            ? `Anyone with this link can pay you ${amountLabel} USDC.`
            : 'Anyone with this link can pay you any amount.'}{' '}
          The link uses a one-time routing address — your private address stays hidden.
        </p>

        <PaymentLinkQrCode value={paymentLink} />

        <div className={styles.linkCard}>
          <p className={styles.linkValue}>{paymentLink}</p>
          {note ? (
            <div className={styles.metaRow}>
              <p className={styles.metaLabel}>Note</p>
              <p className={styles.metaValueNote}>{note}</p>
            </div>
          ) : null}
          <div className={styles.metaRow}>
            <p className={styles.metaLabel}>Routing address</p>
            <p className={styles.metaValue}>{truncateArmadaAddress(routingAddress)}</p>
          </div>
          <div className={styles.metaRow}>
            <p className={styles.metaLabel}>Expires</p>
            <p className={styles.metaValue}>{expiryLabel}</p>
          </div>
        </div>
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        {nativeShareAvailable && isMobile ? (
          <Button
            variant="primary"
            size="lg"
            label="Share link"
            showIcon={false}
            className={styles.copyLinkButton}
            onClick={() => void handleShareLink()}
          />
        ) : (
          <Button
            variant="primary"
            size="lg"
            label={linkCopied ? 'Link copied' : 'Copy link'}
            showIcon={false}
            className={styles.copyLinkButton}
            onClick={() => void handleCopyLink()}
          />
        )}
        {nativeShareAvailable && !isMobile ? (
          <Button
            variant="secondary"
            size="lg"
            label="Share"
            showIcon={false}
            onClick={() => void handleShareLink()}
          />
        ) : null}
        {revokeConfirmOpen ? (
          <div className={styles.revokeConfirm}>
            <p className={styles.revokeCopy}>Revoke this link? It will stop working immediately.</p>
            <div className={styles.revokeActions}>
              <Button
                variant="secondary"
                size="lg"
                label="Revoke link"
                showIcon={false}
                onClick={handleRevokeConfirm}
              />
              <Button
                variant="ghost"
                size="lg"
                label="Cancel"
                showIcon={false}
                onClick={() => setRevokeConfirmOpen(false)}
              />
            </div>
          </div>
        ) : (
          <button type="button" className={styles.revokeButton} onClick={() => setRevokeConfirmOpen(true)}>
            Revoke link
          </button>
        )}
        <Button variant="secondary" size="lg" label="Done" showIcon={false} onClick={onDone} />
      </div>
    </div>
  )
}
