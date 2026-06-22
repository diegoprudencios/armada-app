import { PlusIcon } from '@heroicons/react/24/outline'
import { IconButton } from '@/components/IconButton'
import { TokenBadge } from '@/components/TokenBadge'
import styles from './DepositTooltip.module.css'

const TOOLTIP_ICON_PX = 34
/** Scaled for v2 illustration tile (102×102). */
const TOOLTIP_ICON_PX_V2 = 51

export interface DepositTooltipProps {
  variant?: 'default' | 'v2'
  onDeposit?: () => void
}

export function DepositTooltip({ variant = 'default', onDeposit }: DepositTooltipProps) {
  const isV2 = variant === 'v2'

  return (
    <aside
      className={[styles.root, isV2 && styles.rootV2].filter(Boolean).join(' ')}
      aria-label="Deposit guidance"
    >
      {!isV2 ? <span className={styles.pointer} aria-hidden /> : null}

      <div className={[styles.iconTile, isV2 && styles.iconTileV2].filter(Boolean).join(' ')}>
        <div
          className={[styles.iconCluster, isV2 && styles.iconClusterV2].filter(Boolean).join(' ')}
          aria-hidden
        >
          <div className={styles.tokenBadgeSlot}>
            <TokenBadge size={isV2 ? TOOLTIP_ICON_PX_V2 : TOOLTIP_ICON_PX} />
          </div>
          <div className={styles.depositButtonSlot}>
            <IconButton
              variant="gradient"
              className={[styles.depositIcon, isV2 && styles.depositIconV2].filter(Boolean).join(' ')}
              iconClassName={[styles.depositIconGlyph, isV2 && styles.depositIconGlyphV2]
                .filter(Boolean)
                .join(' ')}
              icon={<PlusIcon strokeWidth={1.5} aria-hidden />}
              aria-label="Deposit"
            />
          </div>
        </div>
      </div>

      <div className={[styles.textBlock, isV2 && styles.textBlockV2].filter(Boolean).join(' ')}>
        <div className={styles.textStack}>
          <p className={styles.headline}>Make your first deposit</p>
          <p className={`armada-text-ui-body-sm ${styles.body}`}>
            Depositing into Armada&apos;s shielded pool is the first step to move funds privately.
          </p>
        </div>
        {isV2 ? (
          <button type="button" className={styles.depositCta} onClick={onDeposit}>
            Deposit
          </button>
        ) : null}
      </div>
    </aside>
  )
}
