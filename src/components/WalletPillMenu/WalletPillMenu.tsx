import { useEffect, useRef, useState } from 'react'
import type { DepositChainId } from '@/constants/depositChains'
import buttonStyles from '@/components/Button/Button.module.css'
import { SIDE_PANEL_EXIT_MS } from '@/components/SidePanel'
import { WalletMenuShell } from '@/components/WalletMenuPanel'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import type { DemoWalletProvider } from '@/constants/demoWallets'
import { truncateAddress } from '@/utils/format'
import type { ConnectedWallet } from '@/utils/walletMenu'
import styles from './WalletPillMenu.module.css'
import { WalletProviderIcon } from './WalletProviderIcon'

export interface WalletPillMenuProps {
  wallets: readonly ConnectedWallet[]
  activeWalletId: string | null
  onDisconnectWallet: (walletId: string) => void
  onConnectWallet: (provider: DemoWalletProvider) => void
  onDeposit: (walletId: string, chain: DepositChainId) => void
  balanceHidden?: boolean
  onBalanceHiddenChange?: (hidden: boolean) => void
}

export { WalletProviderIcon } from './WalletProviderIcon'

const PILL_ICON_SIZE = 24
const PILL_FADE_MS = 180

function fadeDelayMs(): number {
  if (typeof window === 'undefined') return PILL_FADE_MS
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : PILL_FADE_MS
}

export function WalletPillMenu({
  wallets,
  activeWalletId,
  onDisconnectWallet,
  onConnectWallet,
  onDeposit,
  balanceHidden = false,
  onBalanceHiddenChange,
}: WalletPillMenuProps) {
  const isMobile = useMobileLayout()
  const [panelOpen, setPanelOpen] = useState(false)
  const [pillHidden, setPillHidden] = useState(false)
  const openTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  const activeWallet = wallets.find((wallet) => wallet.id === activeWalletId) ?? wallets[0] ?? null
  const iconWallets = activeWallet ? [activeWallet] : []
  const pillWallet = iconWallets.length === 1 ? iconWallets[0] : null
  const iconStackClassName = [
    styles.triggerIconStack,
    iconWallets.length > 1 ? styles.triggerIconStackOverlap : '',
  ]
    .filter(Boolean)
    .join(' ')

  function clearTimers() {
    if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current)
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    openTimerRef.current = null
    closeTimerRef.current = null
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    if (!pillHidden || panelOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      clearTimers()
      setPillHidden(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pillHidden, panelOpen])

  function openMenu() {
    if (panelOpen) return
    if (isMobile) {
      setPanelOpen(true)
      return
    }
    if (pillHidden) return
    clearTimers()
    setPillHidden(true)
    openTimerRef.current = window.setTimeout(() => {
      setPanelOpen(true)
      openTimerRef.current = null
    }, fadeDelayMs())
  }

  function closeMenu() {
    clearTimers()
    setPanelOpen(false)
    if (isMobile) {
      setPillHidden(false)
      return
    }
    const restoreDelay = fadeDelayMs() === 0 ? 0 : SIDE_PANEL_EXIT_MS
    closeTimerRef.current = window.setTimeout(() => {
      setPillHidden(false)
      closeTimerRef.current = null
    }, restoreDelay)
  }

  return (
    <>
      <div className={styles.root}>
        <button
          type="button"
          className={[
            buttonStyles.btn,
            buttonStyles.secondary,
            styles.trigger,
            pillHidden ? styles.triggerHidden : '',
          ].join(' ')}
          aria-expanded={panelOpen || pillHidden}
          aria-haspopup="dialog"
          tabIndex={pillHidden ? -1 : undefined}
          aria-label={pillWallet ? `Wallet ${truncateAddress(pillWallet.address)}` : 'Wallets'}
          onClick={openMenu}
        >
          <span className={iconStackClassName}>
            {iconWallets.map((wallet) => (
              <span key={wallet.id} className={styles.triggerIcon}>
                <WalletProviderIcon provider={wallet.provider} size={PILL_ICON_SIZE} />
              </span>
            ))}
          </span>
          {pillWallet ? (
            <span className={styles.triggerLabel}>{truncateAddress(pillWallet.address)}</span>
          ) : null}
        </button>
      </div>

      <WalletMenuShell
        open={panelOpen}
        onClose={closeMenu}
        wallets={wallets}
        activeWalletId={activeWalletId}
        onDisconnectWallet={(walletId) => {
          onDisconnectWallet(walletId)
          if (wallets.length <= 1) closeMenu()
        }}
        onConnectWallet={onConnectWallet}
        onDeposit={onDeposit}
        balanceHidden={balanceHidden}
        onBalanceHiddenChange={onBalanceHiddenChange}
      />
    </>
  )
}
