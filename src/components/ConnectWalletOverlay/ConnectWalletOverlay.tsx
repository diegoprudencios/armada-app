import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { WalletItem } from '@/components/WalletItem/WalletItem'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useRestoreFocus } from '@/hooks/useRestoreFocus'
import { CONNECT_WALLET_OPTIONS } from '@/constants/connectWallets'
import type { DemoWalletProvider } from '@/constants/demoWallets'
import styles from './ConnectWalletOverlay.module.css'

export interface ConnectWalletOverlayProps {
  onSelect: (provider: DemoWalletProvider) => void
  onDismiss: () => void
}

export function ConnectWalletOverlay({ onSelect, onDismiss }: ConnectWalletOverlayProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstWalletRef = useRef<HTMLButtonElement>(null)

  useBodyScrollLock(true)
  useRestoreFocus(true)
  useEscapeKey(onDismiss)
  useFocusTrap(dialogRef)

  useEffect(() => {
    firstWalletRef.current?.focus({ preventScroll: true })
  }, [])

  return createPortal(
    <div className={styles.overlay}>
      <div
        ref={dialogRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div>
          <h1 id={titleId} className={styles.title}>
            Connect your wallet
          </h1>
          <p className={styles.subtitle}>Choose a wallet to continue to Armada.</p>
        </div>
        <div className={styles.walletList}>
          {CONNECT_WALLET_OPTIONS.map((wallet, index) => (
            <WalletItem
              key={wallet.id}
              ref={index === 0 ? firstWalletRef : undefined}
              name={wallet.name}
              iconComponent={wallet.icon}
              onClick={() => onSelect(wallet.id)}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
