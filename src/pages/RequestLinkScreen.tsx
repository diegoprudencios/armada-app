import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { Button } from '@/components/Button'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { formatUsdcAmount } from '@/utils/format'
import { parseActiveAmount } from '@/utils/amountInput'
import { canUseNativeShare } from '@/utils/payViaLink'
import { formatPaymentLinkExpiry } from './requestFlowConstants'
import styles from './RequestLinkScreen.module.css'

const TOKEN_BADGE_PX = 40
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

function formatLinkExpiryLabel(expiresAt: number): string {
  const relative = formatPaymentLinkExpiry(expiresAt)
  if (relative === 'Expired') return 'Link expired'
  return `Link ${relative.charAt(0).toLowerCase()}${relative.slice(1)}`
}

function LinkDisplay({ url }: { url: string }) {
  const containerRef = useRef<HTMLParagraphElement>(null)
  const rulerRef = useRef<HTMLSpanElement>(null)
  const [parts, setParts] = useState<{ head: string; tail: string; truncated: boolean }>({
    head: url,
    tail: '',
    truncated: false,
  })

  useLayoutEffect(() => {
    const container = containerRef.current
    const ruler = rulerRef.current
    if (!container || !ruler) return

    const ellipsis = '…'

    const measure = (value: string) => {
      ruler.textContent = value
      return ruler.getBoundingClientRect().width
    }

    const fit = () => {
      const available = container.clientWidth
      if (!available || measure(url) <= available) {
        setParts({ head: url, tail: '', truncated: false })
        return
      }

      let headLen = 1
      let tailLen = 1

      while (headLen + tailLen < url.length) {
        const head = url.slice(0, headLen)
        const tail = url.slice(url.length - tailLen)
        const width = measure(head) + measure(ellipsis) + measure(tail)
        if (width > available) break
        headLen += 1
        tailLen += 1
      }

      headLen = Math.max(1, headLen - 1)
      tailLen = Math.max(1, tailLen - 1)

      setParts({
        head: url.slice(0, headLen),
        tail: url.slice(url.length - tailLen),
        truncated: true,
      })
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(container)
    return () => observer.disconnect()
  }, [url])

  return (
    <p ref={containerRef} className={styles.linkValue} title={url}>
      <span ref={rulerRef} className={styles.linkRuler} aria-hidden />
      {parts.truncated ? (
        <>
          <span className={styles.linkStart}>{parts.head}</span>
          <span className={styles.linkEllipsis} aria-hidden>
            …
          </span>
          <span className={styles.linkEnd}>{parts.tail}</span>
        </>
      ) : (
        url
      )}
    </p>
  )
}

export interface RequestLinkScreenProps {
  paymentLink: string
  amount?: string
  note?: string
  expiresAt: number
  revoked: boolean
  onRevoke: () => void
  onDone: () => void
}

export function RequestLinkScreen({
  paymentLink,
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
  const expiryLabel = formatLinkExpiryLabel(expiresAt)

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

        <div className={styles.linkCard}>
          <p className={styles.linkCardSubtitle}>
            {amountLabel
              ? `Anyone with this link can pay you ${amountLabel} USDC.`
              : 'Anyone with this link can pay you any amount.'}
          </p>

          {amountLabel ? (
            <div className={styles.amountRow}>
              <div className={styles.amountGroup}>
                <div className={styles.tokenBadge} aria-hidden>
                  <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
                </div>
                <span className={styles.amountValue}>{amountLabel}</span>
              </div>
            </div>
          ) : null}

          <LinkDisplay url={paymentLink} />
          {note ? (
            <div className={styles.metaRow}>
              <p className={styles.metaLabel}>Note</p>
              <p className={styles.metaValueNote}>{note}</p>
            </div>
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
                  className={`${styles.linkCardActionButton} ${styles.revokeButtonDestructive}`}
                  onClick={handleRevokeConfirm}
                />
                <Button
                  variant="ghost"
                  size="lg"
                  label="Cancel"
                  showIcon={false}
                  className={styles.linkCardActionButton}
                  onClick={() => setRevokeConfirmOpen(false)}
                />
              </div>
            </div>
          ) : (
            <div className={styles.linkCardActions}>
              {nativeShareAvailable && isMobile ? (
                <Button
                  variant="primary"
                  size="lg"
                  label="Share link"
                  showIcon={false}
                  className={styles.linkCardActionButton}
                  onClick={() => void handleShareLink()}
                />
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  label={linkCopied ? 'Link copied' : 'Copy link'}
                  showIcon={false}
                  className={styles.linkCardActionButton}
                  onClick={() => void handleCopyLink()}
                />
              )}
              {nativeShareAvailable && !isMobile ? (
                <Button
                  variant="secondary"
                  size="lg"
                  label="Share"
                  showIcon={false}
                  className={styles.linkCardActionButton}
                  onClick={() => void handleShareLink()}
                />
              ) : null}
              <Button
                variant="secondary"
                size="lg"
                label="Revoke link"
                showIcon={false}
                className={`${styles.linkCardActionButton} ${styles.revokeButtonDestructive}`}
                onClick={() => setRevokeConfirmOpen(true)}
              />
              <p className={styles.expiryCaption}>{expiryLabel}</p>
            </div>
          )}
        </div>
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        <Button variant="secondary" size="lg" label="Done" showIcon={false} onClick={onDone} />
      </div>
    </div>
  )
}
