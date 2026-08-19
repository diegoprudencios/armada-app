import { type CSSProperties, type ReactNode } from 'react'
import styles from './ArmadaAppDashboard.module.css'

export interface DashboardCardStackProps {
  stackClassName?: string
  showDepositTooltip: boolean
  showEarnBanner?: boolean
  activityVisible: boolean
  balanceCard: ReactNode
  activityList?: ReactNode
  depositTooltip?: ReactNode
  earnBanner?: ReactNode
  tooltipEnterStyle?: CSSProperties
  activityEnterStyle?: CSSProperties
}

export function DashboardCardStack({
  stackClassName,
  showDepositTooltip,
  showEarnBanner = false,
  activityVisible,
  balanceCard,
  activityList,
  depositTooltip,
  earnBanner,
  tooltipEnterStyle,
  activityEnterStyle,
}: DashboardCardStackProps) {
  const showPromoBanner =
    (showDepositTooltip && Boolean(depositTooltip)) || (showEarnBanner && Boolean(earnBanner))

  return (
    <div
      className={[styles.cardStack, stackClassName].filter(Boolean).join(' ')}
      data-activity-visible={activityVisible ? 'true' : 'false'}
      data-deposit-tooltip={showPromoBanner ? 'visible' : 'hidden'}
    >
      <div className={styles.primaryStack}>
        <div className={styles.cardStackBalance}>{balanceCard}</div>
        {showDepositTooltip && depositTooltip ? (
          <div
            className={[styles.cardStackTooltip, styles.tooltipEnter].join(' ')}
            style={tooltipEnterStyle}
          >
            {depositTooltip}
          </div>
        ) : null}
        {showEarnBanner && earnBanner ? (
          <div
            className={[styles.cardStackTooltip, styles.tooltipEnter].join(' ')}
            style={tooltipEnterStyle}
          >
            {earnBanner}
          </div>
        ) : null}
      </div>
      {activityVisible && activityList ? (
        <div className={styles.cardStackActivity} style={activityEnterStyle}>
          {activityList}
        </div>
      ) : null}
    </div>
  )
}
