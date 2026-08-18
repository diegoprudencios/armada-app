import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { formatUsdcAmount } from '@/utils/format'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatPaymentLinkExpiry } from './requestFlowConstants'
import styles from './RequestLinkScreen.module.css'

function formatExpireInLabel(expiresAt: number): string {
  const relative = formatPaymentLinkExpiry(expiresAt)
  if (relative === 'Expired') return 'Expired'
  return relative.replace(/^Expires /, 'Expire ')
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

function FittedAmountValue({ label }: { label: string }) {
  const valueRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const value = valueRef.current
    if (!value) return

    const root = getComputedStyle(document.documentElement)
    const fourXl = Number.parseFloat(root.getPropertyValue('--primitives-fontSize-4xl'))
    const spacing3 = Number.parseFloat(root.getPropertyValue('--primitives-spacing-3'))
    const minSize = Number.parseFloat(root.getPropertyValue('--primitives-fontSize-lg'))
    const maxSize = fourXl + spacing3

    const fit = () => {
      value.style.setProperty('--amount-size', String(maxSize))
      const available = value.clientWidth
      const needed = value.scrollWidth
      if (!available || needed <= available) return

      const next = Math.max(minSize, maxSize * (available / needed))
      value.style.setProperty('--amount-size', String(next))
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(value)
    return () => observer.disconnect()
  }, [label])

  return (
    <span ref={valueRef} className={`${styles.amountValue} ${styles.enter} ${styles.enterAmount}`}>
      {label}
    </span>
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
  note: _note,
  expiresAt,
  revoked,
  onRevoke,
  onDone,
}: RequestLinkScreenProps) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false)
  const linkCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const amountLabel = amount ? formatUsdcAmount(parseActiveAmount(amount)) : null
  const expiryLabel = formatExpireInLabel(expiresAt)

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
        <div className={`${styles.header} ${modalStepBodyEnter}`}>
          <h1 className={styles.title}>Link revoked</h1>
          <p className={styles.lede}>This payment link no longer works. Create a new one anytime.</p>
        </div>
        <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
          <Button
            variant="secondary"
            size="lg"
            label="Done"
            showIcon={false}
            className={styles.doneButton}
            onClick={onDone}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.column}>
      <header className={styles.header}>
        <h1 className={`${styles.title} ${styles.enter} ${styles.enterTitle}`}>USDC payment request</h1>
        {amountLabel ? <FittedAmountValue label={amountLabel} /> : null}
      </header>

      {revokeConfirmOpen ? (
        <div className={styles.revokeConfirm}>
          <p className={styles.revokeCopy}>Revoke this link? It will stop working immediately.</p>
          <div className={styles.revokeActions}>
            <Button
              variant="secondary"
              size="md"
              label="Revoke link"
              showIcon={false}
              className={`${styles.linkCardActionButton} ${styles.revokeButtonDestructive}`}
              onClick={handleRevokeConfirm}
            />
            <Button
              variant="ghost"
              size="md"
              label="Cancel"
              showIcon={false}
              className={styles.linkCardActionButton}
              onClick={() => setRevokeConfirmOpen(false)}
            />
          </div>
        </div>
      ) : (
        <div className={styles.linkSection}>
          <div className={`${styles.linkHeading} ${styles.enter} ${styles.enterShareRow}`}>
            <p className={styles.linkHeadingLabel}>Share this link</p>
            <p className={styles.expiryPill}>{expiryLabel}</p>
          </div>
          <div className={`${styles.linkBox} ${styles.enter} ${styles.enterLinkBox}`}>
            <LinkDisplay url={paymentLink} />
          </div>
          <Button
            variant="primary"
            size="md"
            label={linkCopied ? 'Copied' : 'Copy'}
            showIcon={false}
            className={`${styles.copyButton} ${styles.enter} ${styles.enterCopy}`}
            onClick={() => void handleCopyLink()}
          />
          <span className={styles.copyStatus} role="status" aria-live="polite">
            {linkCopied ? 'Link copied to clipboard' : ''}
          </span>
        </div>
      )}

      {revokeConfirmOpen ? null : (
        <button
          type="button"
          className={`${styles.revokeLink} ${styles.enter} ${styles.enterRevoke}`}
          onClick={() => setRevokeConfirmOpen(true)}
        >
          Revoke link
        </button>
      )}
    </div>
  )
}
