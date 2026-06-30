import { ArmadaLogo } from '@/components/ArmadaLogo'
import { WalletButton } from '@/components/WalletButton'
import { WalletPillMenu } from '@/components/WalletPillMenu'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import type { DepositChainId } from '@/components/DepositAmountCard'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import type { ConnectedWallet } from '@/utils/walletMenu'
import styles from './DashboardHeader.module.css'

const DASHBOARD_LIGHT_LOGO_SRC = `${import.meta.env.BASE_URL}armada-logo-dashboard-light.png`

export interface DashboardHeaderProps {
  wallets: readonly ConnectedWallet[]
  activeWalletId: string | null
  onConnect?: () => void
  onSelectWallet: (walletId: string) => void
  onDisconnectWallet: (walletId: string) => void
  onConnectWallet: (provider: DemoWalletProvider) => void
  onDeposit: (walletId: string, chain: DepositChainId) => void
  balanceHidden?: boolean
  onBalanceHiddenChange?: (hidden: boolean) => void
}

/** Logo left + wallet pill right — opens wallet side panel / bottom sheet. */
export function DashboardHeader({
  wallets,
  activeWalletId,
  onConnect,
  onSelectWallet,
  onDisconnectWallet,
  onConnectWallet,
  onDeposit,
  balanceHidden,
  onBalanceHiddenChange,
}: DashboardHeaderProps) {
  const isMobile = useMobileLayout()

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        {isMobile ? (
          <ArmadaLogo variant="mark" markTone="white" className={styles.logoMark} />
        ) : (
          <>
            <ArmadaLogo className={`${styles.logoFull} ${styles.logoDark}`} />
            <img
              className={`${styles.logoFull} ${styles.logoLight}`}
              src={DASHBOARD_LIGHT_LOGO_SRC}
              alt="Armada"
              width={132}
              height={32}
            />
          </>
        )}
      </div>
      <div className={styles.wallet}>
        {wallets.length > 0 ? (
          <WalletPillMenu
            wallets={wallets}
            activeWalletId={activeWalletId}
            onSelectWallet={onSelectWallet}
            onDisconnectWallet={onDisconnectWallet}
            onConnectWallet={onConnectWallet}
            onDeposit={onDeposit}
            balanceHidden={balanceHidden}
            onBalanceHiddenChange={onBalanceHiddenChange}
          />
        ) : (
          <WalletButton
            label="Connect wallet"
            ariaLabel="Connect wallet"
            onClick={onConnect}
          />
        )}
      </div>
    </header>
  )
}
