import { PlusIcon } from '@heroicons/react/24/outline'
import { IconButton } from '@/components/IconButton'
import { TokenBadge } from '@/components/TokenBadge'
import styles from './DepositTooltip.module.css'

const TOOLTIP_ICON_PX = 34

export function DepositTooltip() {
  return (
    <aside className={styles.root} aria-label="Deposit guidance">
      <span className={styles.pointer} aria-hidden />

      <div className={styles.iconTile}>
        <div className={styles.iconCluster} aria-hidden>
          <div className={styles.tokenBadgeSlot}>
            <TokenBadge size={TOOLTIP_ICON_PX} />
          </div>
          <div className={styles.depositButtonSlot}>
            <IconButton
              variant="gradient"
              className={styles.depositIcon}
              iconClassName={styles.depositIconGlyph}
              icon={<PlusIcon strokeWidth={1.5} aria-hidden />}
              aria-label="Deposit"
            />
          </div>
        </div>
      </div>

      <div className={styles.textBlock}>
        <p className={styles.headline}>Make your first deposit</p>
        <p className={`armada-text-ui-body-sm ${styles.body}`}>
          Depositing into Armada&apos;s shielded pool is the first step to move funds privately.
        </p>
      </div>
    </aside>
  )
}
