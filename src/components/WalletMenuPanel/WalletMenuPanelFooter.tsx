import { useEffect, useState } from 'react'
import {
  DASHBOARD_VERSION_PATHS,
  getDashboardVersionFromPath,
  type DashboardVersion,
} from '@/utils/dashboardVersion'
import type { WalletPanelVersion } from '@/utils/walletPanelVersion'
import styles from './WalletMenuPanel.module.css'

export interface WalletMenuPanelFooterProps {
  walletPanelVersion: WalletPanelVersion
  onWalletPanelVersionChange: (version: WalletPanelVersion) => void
}

export function WalletMenuPanelFooter({
  walletPanelVersion,
  onWalletPanelVersionChange,
}: WalletMenuPanelFooterProps) {
  const [dashboardVersion, setDashboardVersion] = useState<DashboardVersion>(() =>
    getDashboardVersionFromPath(),
  )

  useEffect(() => {
    setDashboardVersion(getDashboardVersionFromPath())
  }, [])

  return (
    <footer className={styles.panelFooter}>
      <div>
        <span className={styles.menuSectionLabel}>Dashboard version</span>
        <div className={styles.segmented} role="group" aria-label="Dashboard version">
          <a
            className={[styles.segment, dashboardVersion === 'v1' && styles.segmentActive]
              .filter(Boolean)
              .join(' ')}
            href={DASHBOARD_VERSION_PATHS.v1}
            aria-current={dashboardVersion === 'v1' ? 'page' : undefined}
          >
            v01
          </a>
          <a
            className={[styles.segment, dashboardVersion === 'v2' && styles.segmentActive]
              .filter(Boolean)
              .join(' ')}
            href={DASHBOARD_VERSION_PATHS.v2}
            aria-current={dashboardVersion === 'v2' ? 'page' : undefined}
          >
            v02
          </a>
        </div>
      </div>

      <div>
        <span className={styles.menuSectionLabel}>Wallet panel</span>
        <div className={styles.segmented} role="group" aria-label="Wallet panel version">
          <button
            type="button"
            className={[styles.segment, walletPanelVersion === 'v1' && styles.segmentActive]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={walletPanelVersion === 'v1'}
            onClick={() => onWalletPanelVersionChange('v1')}
          >
            v01
          </button>
          <button
            type="button"
            className={[styles.segment, walletPanelVersion === 'v2' && styles.segmentActive]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={walletPanelVersion === 'v2'}
            onClick={() => onWalletPanelVersionChange('v2')}
          >
            v02
          </button>
        </div>
      </div>
    </footer>
  )
}
