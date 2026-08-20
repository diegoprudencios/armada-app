import { ArmadaLogo } from '@/components/ArmadaLogo'
import { WalletButton } from '@/components/WalletButton'
import { WalletPillMenu } from '@/components/WalletPillMenu'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import type { DepositChainId } from '@/constants/depositChains'
import type { DemoWalletProvider } from '@/constants/demoWallets'
import type { ConnectedWallet } from '@/utils/walletMenu'
import styles from './DashboardHeader.module.css'

export interface DashboardHeaderProps {
  wallets: readonly ConnectedWallet[]
  activeWalletId: string | null
  onConnect?: () => void
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
          <>
            <ArmadaLogo className={`${styles.logoFullMobile} ${styles.logoDark}`} />
            <ArmadaLogo
              markTone="ink"
              className={`${styles.logoFullMobile} ${styles.logoLight}`}
            />
          </>
        ) : (
          <>
            <ArmadaLogo className={`${styles.logoFull} ${styles.logoDark}`} />
            <ArmadaLogo markTone="ink" className={`${styles.logoFull} ${styles.logoLight}`} />
          </>
        )}
      </div>
      <div className={styles.wallet}>
        {wallets.length > 0 ? (
          <WalletPillMenu
            wallets={wallets}
            activeWalletId={activeWalletId}
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
