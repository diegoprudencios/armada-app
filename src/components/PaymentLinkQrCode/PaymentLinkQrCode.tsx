import { QRCodeSVG } from 'qrcode.react'
import styles from './PaymentLinkQrCode.module.css'

export interface PaymentLinkQrCodeProps {
  value: string
  label?: string
}

export function PaymentLinkQrCode({ value, label = 'Payment link QR code' }: PaymentLinkQrCodeProps) {
  return (
    <div className={styles.root} role="img" aria-label={label}>
      <QRCodeSVG
        value={value}
        size={200}
        level="M"
        className={styles.qr}
        bgColor="transparent"
        fgColor="currentColor"
      />
    </div>
  )
}
