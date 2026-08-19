import { useMemo, type ReactNode } from 'react'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { Button } from '@/components/Button'
import { PaymentLinkQrCode } from '@/components/PaymentLinkQrCode'
import { APP_DASHBOARD_PATH } from '@/utils/appNavigation'
import { formatUsdcAmount, truncateArmadaAddress } from '@/utils/format'
import { parseActiveAmount } from '@/utils/amountInput'
import { parsePayViaLinkSearch, writePendingPayViaLink } from '@/utils/payViaLink'
import { formatPaymentLinkExpiry } from './requestFlowConstants'
import styles from './PayViaLinkLanding.module.css'

function LandingFrame({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <div className={`${styles.logoWrap} ${styles.enter} ${styles.enterLogo}`}>
          <ArmadaLogo variant="full" markTone="deep" className={styles.logo} />
        </div>
        <div className={styles.card}>{children}</div>
      </div>
    </main>
  )
}

function GoToArmadaButton() {
  return (
    <div className={`${styles.actions} ${styles.enter} ${styles.enterCta}`}>
      <Button
        variant="secondary"
        size="lg"
        label="Go to Armada"
        showIcon={false}
        className={styles.cta}
        onClick={() => window.location.assign(APP_DASHBOARD_PATH)}
      />
    </div>
  )
}

export function PayViaLinkLanding() {
  const parsed = useMemo(() => parsePayViaLinkSearch(window.location.search), [])

  function handleContinue() {
    if (parsed.status !== 'ok') return
    writePendingPayViaLink(parsed.params)
    window.location.assign(APP_DASHBOARD_PATH)
  }

  if (parsed.status === 'invalid') {
    return (
      <LandingFrame>
        <header className={`${styles.header} ${styles.enter} ${styles.enterTitle}`}>
          <h1 className={styles.title}>This payment link is invalid</h1>
          <p className={styles.body}>Check that the link is complete, then try again.</p>
        </header>
        <GoToArmadaButton />
      </LandingFrame>
    )
  }

  if (parsed.status === 'expired') {
    return (
      <LandingFrame>
        <header className={`${styles.header} ${styles.enter} ${styles.enterTitle}`}>
          <h1 className={styles.title}>This payment link expired</h1>
          <p className={styles.body}>Ask the sender for a new link to complete the payment.</p>
        </header>
        <GoToArmadaButton />
      </LandingFrame>
    )
  }

  if (parsed.status === 'revoked') {
    return (
      <LandingFrame>
        <header className={`${styles.header} ${styles.enter} ${styles.enterTitle}`}>
          <h1 className={styles.title}>This payment link was revoked</h1>
          <p className={styles.body}>The sender cancelled this request. Ask them to send a new link.</p>
        </header>
        <GoToArmadaButton />
      </LandingFrame>
    )
  }

  const { params } = parsed
  const amountLabel = params.amount ? formatUsdcAmount(parseActiveAmount(params.amount)) : null
  const expiryLabel = formatPaymentLinkExpiry(params.expiresAt)
  const paymentUrl = window.location.href

  return (
    <LandingFrame>
      <header className={styles.header}>
        <h1 className={`${styles.title} ${styles.enter} ${styles.enterTitle}`}>USDC payment request</h1>
        {amountLabel ? (
          <p className={`${styles.amountValue} ${styles.enter} ${styles.enterAmount}`}>{amountLabel}</p>
        ) : null}
        <p className={`${styles.body} ${styles.enter} ${styles.enterBody}`}>
          You&apos;ve been asked to send USDC privately through Armada.
        </p>
      </header>

      <div className={`${styles.enter} ${styles.enterQr}`}>
        <PaymentLinkQrCode
          value={paymentUrl}
          label="Scan to open payment request"
          className={styles.qrBox}
        />
      </div>

      <dl className={`${styles.summary} ${styles.enter} ${styles.enterSummary}`}>
        {params.note ? (
          <div className={styles.summaryRow}>
            <dt className={styles.summaryLabel}>Note</dt>
            <dd className={`${styles.summaryValue} ${styles.summaryNote}`}>{params.note}</dd>
          </div>
        ) : null}
        <div className={styles.summaryRow}>
          <dt className={styles.summaryLabel}>To</dt>
          <dd className={styles.summaryValue}>{truncateArmadaAddress(params.recipient)}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt className={styles.summaryLabel}>Expires</dt>
          <dd className={styles.expiryPill}>{expiryLabel.replace(/^Expires /, 'Expire ')}</dd>
        </div>
      </dl>

      <div className={`${styles.actions} ${styles.enter} ${styles.enterCta}`}>
        <Button
          variant="primary"
          size="lg"
          label="Continue to pay"
          showIcon={false}
          className={styles.cta}
          onClick={handleContinue}
        />
      </div>
    </LandingFrame>
  )
}
