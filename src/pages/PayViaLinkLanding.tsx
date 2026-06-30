import { useMemo } from 'react'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { Button } from '@/components/Button'
import { PaymentLinkQrCode } from '@/components/PaymentLinkQrCode'
import { APP_DASHBOARD_V2_PATH } from '@/utils/appNavigation'
import { formatUsdcAmount, truncateArmadaAddress } from '@/utils/format'
import { parseActiveAmount } from '@/utils/amountInput'
import { parsePayViaLinkSearch, writePendingPayViaLink } from '@/utils/payViaLink'
import { formatPaymentLinkExpiry } from './requestFlowConstants'
import styles from './PayViaLinkLanding.module.css'

export function PayViaLinkLanding() {
  const parsed = useMemo(() => parsePayViaLinkSearch(window.location.search), [])

  function handleContinue() {
    if (parsed.status !== 'ok') return
    writePendingPayViaLink(parsed.params)
    window.location.assign(APP_DASHBOARD_V2_PATH)
  }

  if (parsed.status === 'invalid') {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <ArmadaLogo variant="mark" markTone="white" />
          </div>
          <h1 className={styles.errorTitle}>This payment link is invalid</h1>
          <p className={styles.body}>
            Check that the link is complete, then try again.
          </p>
          <Button
            variant="secondary"
            size="lg"
            label="Go to Armada"
            showIcon={false}
            onClick={() => window.location.assign(APP_DASHBOARD_V2_PATH)}
          />
        </div>
      </main>
    )
  }

  if (parsed.status === 'expired') {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <ArmadaLogo variant="mark" markTone="white" />
          </div>
          <h1 className={styles.errorTitle}>This payment link expired</h1>
          <p className={styles.body}>Ask the sender for a new link to complete the payment.</p>
          <Button
            variant="secondary"
            size="lg"
            label="Go to Armada"
            showIcon={false}
            onClick={() => window.location.assign(APP_DASHBOARD_V2_PATH)}
          />
        </div>
      </main>
    )
  }

  if (parsed.status === 'revoked') {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <ArmadaLogo variant="mark" markTone="white" />
          </div>
          <h1 className={styles.errorTitle}>This payment link was revoked</h1>
          <p className={styles.body}>The sender cancelled this request. Ask them to send a new link.</p>
          <Button
            variant="secondary"
            size="lg"
            label="Go to Armada"
            showIcon={false}
            onClick={() => window.location.assign(APP_DASHBOARD_V2_PATH)}
          />
        </div>
      </main>
    )
  }

  const { params } = parsed
  const amountLabel = params.amount ? formatUsdcAmount(parseActiveAmount(params.amount)) : null
  const expiryLabel = formatPaymentLinkExpiry(params.expiresAt)
  const paymentUrl = window.location.href

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <ArmadaLogo variant="mark" markTone="white" />
        </div>
        <h1 className={styles.title}>Payment request</h1>
        <p className={styles.body}>You&apos;ve been asked to send USDC privately through Armada.</p>

        <PaymentLinkQrCode value={paymentUrl} label="Scan to open payment request" />

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <p className={styles.summaryLabel}>Amount</p>
            <p className={[styles.summaryValue, styles.amountValue].join(' ')}>
              {amountLabel ? `${amountLabel} USDC` : 'Any amount'}
            </p>
          </div>
          {params.note ? (
            <div className={styles.summaryRow}>
              <p className={styles.summaryLabel}>Note</p>
              <p className={styles.summaryNote}>{params.note}</p>
            </div>
          ) : null}
          <div className={styles.summaryRow}>
            <p className={styles.summaryLabel}>To</p>
            <p className={styles.summaryValue}>{truncateArmadaAddress(params.recipient)}</p>
          </div>
          <div className={styles.summaryRow}>
            <p className={styles.summaryLabel}>Expires</p>
            <p className={styles.summaryValue}>{expiryLabel}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" size="lg" label="Continue to pay" showIcon={false} onClick={handleContinue} />
        </div>
      </div>
    </main>
  )
}
