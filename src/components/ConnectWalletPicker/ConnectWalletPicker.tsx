import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { BottomSheet } from '@/components/BottomSheet'
import { WalletItem } from '@/components/WalletItem/WalletItem'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { CONNECT_WALLET_OPTIONS } from '@/constants/connectWallets'
import type { DemoWalletProvider } from '@/constants/demoWallets'
import styles from './ConnectWalletPicker.module.css'

export interface ConnectWalletPickerProps {
  onSelect: (provider: DemoWalletProvider) => void
  disabledProviders?: ReadonlySet<DemoWalletProvider>
}

export function ConnectWalletPicker({
  onSelect,
  disabledProviders = new Set(),
}: ConnectWalletPickerProps) {
  const isMobile = useMobileLayout()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({})

  const handleSelect = (provider: DemoWalletProvider) => {
    onSelect(provider)
    setOpen(false)
  }

  useEffect(() => {
    if (!open || isMobile) return

    const updatePosition = () => {
      const anchor = rootRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const gap = 8

      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + gap,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        zIndex: 210,
        width: Math.max(rect.width, 280),
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, isMobile])

  useEffect(() => {
    if (!open || isMobile) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, isMobile])

  const walletItems = CONNECT_WALLET_OPTIONS.map((wallet) => (
    <WalletItem
      key={wallet.id}
      name={wallet.name}
      iconComponent={wallet.icon}
      disabled={disabledProviders.has(wallet.id)}
      onClick={() => handleSelect(wallet.id)}
    />
  ))

  return (
    <>
      <div className={styles.root} ref={rootRef}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((prev) => !prev)}
        >
          Connect a new wallet
        </button>
      </div>

      {open && !isMobile
        ? createPortal(
            <>
              <button
                type="button"
                className={styles.backdrop}
                aria-label="Close connect wallet menu"
                onClick={() => setOpen(false)}
              />
              <div
                ref={dropdownRef}
                className={styles.dropdown}
                role="menu"
                aria-label="Connect wallet"
                style={dropdownStyle}
              >
                <div className={styles.walletList}>{walletItems}</div>
              </div>
            </>,
            document.body,
          )
        : null}

      {isMobile ? (
        <BottomSheet open={open} onClose={() => setOpen(false)} ariaLabel="Connect wallet">
          <div className={styles.sheetWalletList}>{walletItems}</div>
        </BottomSheet>
      ) : null}
    </>
  )
}
