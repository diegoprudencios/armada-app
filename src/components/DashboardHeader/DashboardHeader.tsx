import { ArmadaLogo } from '@/components/ArmadaLogo'
import { WalletButton } from '@/components/WalletButton'
import { WalletPillMenu } from '@/components/WalletPillMenu'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { truncateAddress } from '@/utils/format'
import type { DemoWallet } from '@/utils/demoDashboardSession'
import styles from './DashboardHeader.module.css'

const DASHBOARD_LIGHT_LOGO_SRC = `${import.meta.env.BASE_URL}armada-logo-dashboard-light.png`

export interface DashboardHeaderProps {
  wallet: DemoWallet | null
  usdcBalance?: number
  onConnect?: () => void
  onDisconnect?: () => void
}

/** Logo left + wallet pill right — nav stripped; uses real WalletPillMenu dropdown. */
export function DashboardHeader({
  wallet,
  usdcBalance = 0,
  onConnect,
  onDisconnect,
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
        {wallet ? (
          <WalletPillMenu
            displayAddress={truncateAddress(wallet.address)}
            copyAddress={wallet.address}
            walletProvider={wallet.provider}
            usdcBalance={usdcBalance}
            onDisconnect={onDisconnect}
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
