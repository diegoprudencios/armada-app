import type { DepositChainId } from '@/constants/depositChains'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import type { ConnectedWallet } from '@/utils/walletMenu'
import { WalletMenuPanelEthereum } from './WalletMenuPanelEthereum'
import styles from './WalletMenuPanel.module.css'

export interface WalletMenuPanelProps {
  wallets: readonly ConnectedWallet[]
  activeWalletId: string | null
  showClose?: boolean
  onClose?: () => void
  onDisconnectWallet: (walletId: string) => void
  onConnectWallet: (provider: DemoWalletProvider) => void
  onDeposit: (walletId: string, chain: DepositChainId) => void
  balanceHidden?: boolean
  onBalanceHiddenChange?: (hidden: boolean) => void
}

export function WalletMenuPanel(props: WalletMenuPanelProps) {
  return (
    <div className={styles.panelLayout}>
      <WalletMenuPanelEthereum {...props} />
    </div>
  )
}
