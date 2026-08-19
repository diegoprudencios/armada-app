import { type CSSProperties, useRef, useState } from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { DASHBOARD_ACTIVITY_BOTTOM_SPACING_PX } from '@/constants/activityList'
import { BalanceCard } from '@/components/BalanceCard'
import {
  DASHBOARD_TOOLTIP_ENTER_DELAY_MS,
  dashboardActivityEnterDelayMs,
} from '@/components/BalanceCard/balanceRevealMotion'
import { DashboardScrollTopFade } from '@/components/DashboardScrollTopFade'
import { DashboardHeader } from '@/components/DashboardHeader'
import { DepositTooltip } from '@/components/DepositTooltip'
import { RecentActivityList } from '@/components/RecentActivityList'
import { useDashboardDemoState } from '@/hooks/useDashboardDemoState'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { useRequireConnectedWallet } from '@/hooks/useRequireConnectedWallet'
import { DashboardOverlays } from './DashboardOverlays'
import { DashboardCardStack } from './DashboardCardStack'
import { EarnChooserSheet } from './EarnChooserSheet'
import { DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import {
  DEMO_EARN_APY,
  EARN_APY_BANNER_BODY,
  EARN_APY_BANNER_TOOLTIP,
  earnApyBannerHeadline,
  formatDemoApy,
} from './earnFlowConstants'
import styles from './ArmadaAppDashboard.module.css'

export interface ArmadaAppDashboardProps {
  balance?: number
  onSend?: () => void
  onRequest?: () => void
}

/** Dashboard shell. */
export function ArmadaAppDashboard({
  balance: initialBalance = 0,
  onSend,
  onRequest,
}: ArmadaAppDashboardProps) {
  const isMobile = useMobileLayout()
  const [vaultChooserOpen, setVaultChooserOpen] = useState(false)
  const state = useDashboardDemoState(initialBalance)
  const activityVisibleOnPaintRef = useRef<boolean | null>(null)
  const {
    wallet,
    connectedWallets,
    activeWalletId,
    dashboardBalance,
    balanceRoll,
    showDepositTooltip,
    depositTooltipPersistVisible,
    depositTooltipExiting,
    showEarnBanner,
    earnBannerHandoffEnter,
    earnBannerPersistVisible,
    openConnect,
    connectWallet,
    disconnectWallet,
    openDepositFromWallet,
    openDeposit,
    openSend,
    openRequest,
    openEarn,
    openWithdraw,
    earningBalance,
    activityVisible,
    toggleActivity,
    recentActivity,
    balanceHidden,
    setBalanceHidden,
    openActivityReceipt,
  } = state

  useRequireConnectedWallet(wallet)

  if (!wallet) return null

  const showActivity = activityVisible && recentActivity.length > 0
  if (activityVisibleOnPaintRef.current === null) {
    activityVisibleOnPaintRef.current = showActivity
  }
  const activityEnterDelayMs = dashboardActivityEnterDelayMs(
    showDepositTooltip || showEarnBanner,
    activityVisibleOnPaintRef.current,
  )

  return (
    <div
      className={styles.shell}
      data-activity-visible={showActivity ? 'true' : 'false'}
      style={
        showActivity
          ? ({
              '--dashboard-activity-bottom-spacing': `${DASHBOARD_ACTIVITY_BOTTOM_SPACING_PX}px`,
            } as CSSProperties)
          : undefined
      }
    >
      <DashboardScrollTopFade enabled={showActivity} />
      <div className={styles.headerBand}>
        <DashboardHeader
          wallets={connectedWallets}
          activeWalletId={activeWalletId}
          onConnect={openConnect}
          onDisconnectWallet={disconnectWallet}
          onConnectWallet={connectWallet}
          onDeposit={openDepositFromWallet}
          balanceHidden={balanceHidden}
          onBalanceHiddenChange={setBalanceHidden}
        />
      </div>
      <DashboardCardStack
        showDepositTooltip={showDepositTooltip}
        depositTooltipPersistVisible={depositTooltipPersistVisible}
        depositTooltipExiting={depositTooltipExiting}
        showEarnBanner={showEarnBanner}
        earnBannerHandoffEnter={earnBannerHandoffEnter}
        earnBannerPersistVisible={earnBannerPersistVisible}
        activityVisible={showActivity}
        tooltipEnterStyle={
          {
            '--dashboard-tooltip-enter-delay': `${DASHBOARD_TOOLTIP_ENTER_DELAY_MS}ms`,
          } as CSSProperties
        }
        activityEnterStyle={
          {
            '--dashboard-activity-enter-delay': `${activityEnterDelayMs}ms`,
          } as CSSProperties
        }
        balanceCard={
          <BalanceCard
            balance={dashboardBalance}
            balanceRollTrigger={balanceRoll.trigger}
            balanceRollMode={balanceRoll.mode}
            balanceRollFromValue={balanceRoll.fromValue}
            hasActivityItems={recentActivity.length > 0}
            onSend={onSend ?? openSend}
            onDeposit={openDeposit}
            onRequest={onRequest ?? openRequest}
            onEarn={() => openEarn('add')}
            vaultBalance={earningBalance}
            vaultRollFromValue={balanceRoll.vaultFromValue}
            onVaultOpen={() => {
              if (isMobile) setVaultChooserOpen(true)
              else openEarn('add')
            }}
            activityVisible={activityVisible}
            onToggleActivity={toggleActivity}
            balanceHidden={balanceHidden}
            onBalanceHiddenChange={setBalanceHidden}
            armadaAddress={DEMO_ARMADA_ADDRESS}
          />
        }
        activityList={
          <RecentActivityList
            items={recentActivity}
            balanceRevealed={!balanceHidden}
            onItemClick={openActivityReceipt}
          />
        }
        depositTooltip={
          <DepositTooltip stretch onDeposit={openDeposit} />
        }
        earnBanner={
          <DepositTooltip
            stretch
            BadgeIcon={ChartBarIcon}
            badgeBackground="white"
            iconTileTone="purple"
            headline={earnApyBannerHeadline(DEMO_EARN_APY)}
            ariaLabel={`Estimated yearly yield ${formatDemoApy(DEMO_EARN_APY)}`}
            body={EARN_APY_BANNER_BODY}
            infoTooltip={EARN_APY_BANNER_TOOLTIP}
            onDeposit={() => openEarn('add')}
          />
        }
      />

      <EarnChooserSheet
        open={vaultChooserOpen}
        onClose={() => setVaultChooserOpen(false)}
        onAdd={() => openEarn('add')}
        onWithdraw={() => openEarn('withdraw')}
      />

      <DashboardOverlays state={state} />
    </div>
  )
}
