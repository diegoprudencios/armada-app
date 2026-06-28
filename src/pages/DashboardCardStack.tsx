import { type CSSProperties, type ReactNode } from 'react'
import styles from './ArmadaAppDashboard.module.css'

export interface DashboardCardStackProps {
  stackClassName?: string
  showDepositTooltip: boolean
  activityVisible: boolean
  balanceCard: ReactNode
  activityList?: ReactNode
  depositTooltip?: ReactNode
  tooltipEnterStyle?: CSSProperties
}

export function DashboardCardStack({
  stackClassName,
  showDepositTooltip,
  activityVisible,
  balanceCard,
  activityList,
  depositTooltip,
  tooltipEnterStyle,
}: DashboardCardStackProps) {
  return (
    <div
      className={[styles.cardStack, stackClassName].filter(Boolean).join(' ')}
      data-activity-visible={activityVisible ? 'true' : 'false'}
      data-deposit-tooltip={showDepositTooltip ? 'visible' : 'hidden'}
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
      </div>
      {activityVisible && activityList ? (
        <div className={styles.cardStackActivity}>{activityList}</div>
      ) : null}
    </div>
  )
}
