import { type CSSProperties, type ReactNode, useEffect, useState } from 'react'
import styles from './ArmadaAppDashboard.module.css'

export interface DashboardCardStackProps {
  showDepositTooltip: boolean
  depositTooltipPersistVisible?: boolean
  depositTooltipExiting?: boolean
  showEarnBanner?: boolean
  earnBannerHandoffEnter?: boolean
  earnBannerPersistVisible?: boolean
  activityVisible: boolean
  balanceCard: ReactNode
  activityList?: ReactNode
  depositTooltip?: ReactNode
  earnBanner?: ReactNode
  tooltipEnterStyle?: CSSProperties
  activityEnterStyle?: CSSProperties
}

export function DashboardCardStack({
  showDepositTooltip,
  depositTooltipPersistVisible = false,
  depositTooltipExiting = false,
  showEarnBanner = false,
  earnBannerHandoffEnter = false,
  earnBannerPersistVisible = false,
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
      className={styles.cardStack}
      data-activity-visible={activityVisible ? 'true' : 'false'}
      data-deposit-tooltip={showPromoBanner ? 'visible' : 'hidden'}
    >
      <div className={styles.primaryStack}>
        <div className={styles.cardStackBalance}>{balanceCard}</div>
        {showDepositTooltip && depositTooltip ? (
          <div
            className={[
              styles.cardStackTooltip,
              depositTooltipExiting
                ? styles.tooltipHandoffExit
                : depositTooltipPersistVisible
                  ? styles.tooltipVisible
                  : styles.tooltipEnter,
            ].join(' ')}
            style={
              depositTooltipPersistVisible || depositTooltipExiting
                ? undefined
                : tooltipEnterStyle
            }
          >
            <div className={styles.cardStackTooltipInner}>{depositTooltip}</div>
          </div>
        ) : null}
        {showEarnBanner && earnBanner ? (
          <EarnBannerSlot
            key="earn-apy-banner"
            handoffEnter={earnBannerHandoffEnter}
            persistVisible={earnBannerPersistVisible}
            tooltipEnterStyle={tooltipEnterStyle}
          >
            {earnBanner}
          </EarnBannerSlot>
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

function EarnBannerSlot({
  handoffEnter,
  persistVisible,
  tooltipEnterStyle,
  children,
}: {
  handoffEnter: boolean
  persistVisible: boolean
  tooltipEnterStyle?: CSSProperties
  children: ReactNode
}) {
  const [handoffSettled, setHandoffSettled] = useState(!handoffEnter)

  useEffect(() => {
    if (!handoffEnter) {
      setHandoffSettled(true)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHandoffSettled(true)
      return
    }
    setHandoffSettled(false)
  }, [handoffEnter])

  const enterClass = handoffEnter
    ? styles.tooltipHandoffEnter
    : persistVisible
      ? styles.tooltipVisible
      : styles.tooltipEnter

  return (
    <div
      className={[
        styles.cardStackTooltip,
        enterClass,
        handoffSettled ? styles.tooltipHandoffSettled : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={handoffEnter || persistVisible ? undefined : tooltipEnterStyle}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) return
        setHandoffSettled(true)
      }}
    >
      <div className={styles.cardStackTooltipInner}>{children}</div>
    </div>
  )
}
