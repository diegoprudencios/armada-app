import type { DepositChainId } from '@/constants/depositChains'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import type { ConnectedWallet } from '@/utils/walletMenu'
import { useWalletPanelVersion } from '@/utils/walletPanelVersion'
import { WalletMenuPanelEthereum } from './WalletMenuPanelEthereum'
import { WalletMenuPanelFooter } from './WalletMenuPanelFooter'
import { WalletMenuPanelMulti } from './WalletMenuPanelMulti'
import styles from './WalletMenuPanel.module.css'

/** Dev toggles for dashboard / wallet-panel versions — re-enable when needed. */
const SHOW_VERSION_CONTROLS = false

export interface WalletMenuPanelProps {
  wallets: readonly ConnectedWallet[]
  activeWalletId: string | null
  showClose?: boolean
  onClose?: () => void
  onSelectWallet: (walletId: string) => void
  onDisconnectWallet: (walletId: string) => void
  onConnectWallet: (provider: DemoWalletProvider) => void
  onDeposit: (walletId: string, chain: DepositChainId) => void
  balanceHidden?: boolean
  onBalanceHiddenChange?: (hidden: boolean) => void
}

export function WalletMenuPanel(props: WalletMenuPanelProps) {
  const [walletPanelVersion, setWalletPanelVersion] = useWalletPanelVersion()

  return (
    <div className={styles.panelLayout}>
      {walletPanelVersion === 'v1' ? (
        <WalletMenuPanelEthereum {...props} />
      ) : (
        <WalletMenuPanelMulti {...props} />
      )}

      {SHOW_VERSION_CONTROLS ? (
        <WalletMenuPanelFooter
          walletPanelVersion={walletPanelVersion}
          onWalletPanelVersionChange={setWalletPanelVersion}
        />
      ) : null}
    </div>
  )
}
