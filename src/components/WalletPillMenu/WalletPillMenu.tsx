import { useState } from 'react'
import type { DepositChainId } from '@/components/DepositAmountCard'
import buttonStyles from '@/components/Button/Button.module.css'
import { WalletMenuShell } from '@/components/WalletMenuPanel'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import { truncateAddress } from '@/utils/format'
import { useWalletPanelVersion } from '@/utils/walletPanelVersion'
import type { ConnectedWallet } from '@/utils/walletMenu'
import styles from './WalletPillMenu.module.css'
import { WalletProviderIcon } from './WalletProviderIcon'

export interface WalletPillMenuProps {
  wallets: readonly ConnectedWallet[]
  activeWalletId: string | null
  onSelectWallet: (walletId: string) => void
  onDisconnectWallet: (walletId: string) => void
  onConnectWallet: (provider: DemoWalletProvider) => void
  onDeposit: (walletId: string, chain: DepositChainId) => void
  balanceHidden?: boolean
  onBalanceHiddenChange?: (hidden: boolean) => void
}

export { WalletProviderIcon } from './WalletProviderIcon'

const PILL_ICON_SIZE = 24

export function WalletPillMenu({
  wallets,
  activeWalletId,
  onSelectWallet,
  onDisconnectWallet,
  onConnectWallet,
  onDeposit,
  balanceHidden = false,
  onBalanceHiddenChange,
}: WalletPillMenuProps) {
  const [open, setOpen] = useState(false)
  const [panelVersion] = useWalletPanelVersion()

  const activeWallet = wallets.find((wallet) => wallet.id === activeWalletId) ?? wallets[0] ?? null
  const iconWallets =
    panelVersion === 'v1'
      ? activeWallet
        ? [activeWallet]
        : []
      : wallets
  const pillWallet = iconWallets.length === 1 ? iconWallets[0] : null
  const iconStackClassName = [
    styles.triggerIconStack,
    iconWallets.length > 1 ? styles.triggerIconStackOverlap : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div className={styles.root}>
        <button
          type="button"
          className={[buttonStyles.btn, buttonStyles.secondary, styles.trigger].join(' ')}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
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
        open={open}
        onClose={() => setOpen(false)}
        wallets={wallets}
        activeWalletId={activeWalletId}
        onSelectWallet={onSelectWallet}
        onDisconnectWallet={(walletId) => {
          onDisconnectWallet(walletId)
          if (wallets.length <= 1) setOpen(false)
        }}
        onConnectWallet={onConnectWallet}
        onDeposit={onDeposit}
        balanceHidden={balanceHidden}
        onBalanceHiddenChange={onBalanceHiddenChange}
      />
    </>
  )
}
