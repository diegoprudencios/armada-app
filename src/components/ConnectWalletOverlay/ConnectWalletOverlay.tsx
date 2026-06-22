import type { ReactNode } from 'react'
import {
  WalletMetamask,
  WalletPhantom,
  WalletWalletConnect,
} from '@web3icons/react'
import WalletItem from '@/components/WalletItem/WalletItem'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import styles from './ConnectWalletOverlay.module.css'

export interface ConnectWalletOverlayProps {
  onSelect: (provider: DemoWalletProvider) => void
}

const WALLETS: { id: DemoWalletProvider; name: string; icon: ReactNode }[] = [
  { id: 'metamask', name: 'MetaMask', icon: <WalletMetamask size={24} /> },
  { id: 'phantom', name: 'Phantom', icon: <WalletPhantom size={24} /> },
  { id: 'walletconnect', name: 'WalletConnect', icon: <WalletWalletConnect size={24} /> },
]

export function ConnectWalletOverlay({ onSelect }: ConnectWalletOverlayProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Connect wallet">
      <div className={styles.panel}>
        <div>
          <h1 className={styles.title}>Connect your wallet</h1>
          <p className={styles.subtitle}>Choose a wallet to continue to Armada.</p>
        </div>
        <div className={styles.walletList}>
          {WALLETS.map((wallet) => (
            <WalletItem
              key={wallet.id}
              name={wallet.name}
              iconComponent={wallet.icon}
              onClick={() => onSelect(wallet.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
