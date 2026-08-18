import { type CSSProperties, useState } from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { DASHBOARD_ACTIVITY_BOTTOM_SPACING_PX } from '@/constants/activityList'
import { BalanceCard } from '@/components/BalanceCard'
import { DASHBOARD_TOOLTIP_ENTER_DELAY_MS } from '@/components/BalanceCard/balanceRevealMotion'
import { DashboardScrollTopFade } from '@/components/DashboardScrollTopFade'
import { DashboardHeader } from '@/components/DashboardHeader'
import { DepositTooltip } from '@/components/DepositTooltip'
import { RecentActivityList } from '@/components/RecentActivityList'
import { useDashboardDemoState } from '@/hooks/useDashboardDemoState'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { useRequireConnectedWallet } from '@/hooks/useRequireConnectedWallet'
import { getDashboardVersionFromPath } from '@/utils/dashboardVersion'
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
  onMore?: () => void
}

/** Dashboard shell — v01/v02 layout selected from `/dashboard` vs `/dashboard-v2`. */
export function ArmadaAppDashboard({
  balance: initialBalance = 0,
  onSend,
  onRequest,
  onMore,
}: ArmadaAppDashboardProps) {
  const isMobile = useMobileLayout()
  const [vaultChooserOpen, setVaultChooserOpen] = useState(false)
  const state = useDashboardDemoState(initialBalance)
  const {
    wallet,
    connectedWallets,
    activeWalletId,
    dashboardBalance,
    balanceRoll,
    showDepositTooltip,
    showEarnBanner,
    openConnect,
    connectWallet,
    selectActiveWallet,
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

  const dashboardVersion = getDashboardVersionFromPath()
  const isV2 = dashboardVersion === 'v2'
  const showActivity = activityVisible && recentActivity.length > 0

  return (
    <div
      className={styles.shell}
      data-dashboard-version={dashboardVersion}
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
          onSelectWallet={selectActiveWallet}
          onDisconnectWallet={disconnectWallet}
          onConnectWallet={connectWallet}
          onDeposit={openDepositFromWallet}
          balanceHidden={balanceHidden}
          onBalanceHiddenChange={setBalanceHidden}
        />
      </div>
      <DashboardCardStack
        stackClassName={isV2 ? styles.cardStackV2 : undefined}
        showDepositTooltip={showDepositTooltip}
        showEarnBanner={showEarnBanner}
        activityVisible={showActivity}
        tooltipEnterStyle={
          {
            '--dashboard-tooltip-enter-delay': `${DASHBOARD_TOOLTIP_ENTER_DELAY_MS}ms`,
          } as CSSProperties
        }
        balanceCard={
          <BalanceCard
            balance={dashboardBalance}
            balanceRollTrigger={balanceRoll.trigger}
            balanceRollMode={balanceRoll.mode}
            balanceRollFromValue={balanceRoll.fromValue}
            hasActivityItems={recentActivity.length > 0}
            actionLayout={isV2 ? 'v2' : undefined}
            onSend={onSend ?? openSend}
            onDeposit={openDeposit}
            onRequest={onRequest ?? openRequest}
            onMore={onMore}
            onEarn={() => openEarn('add')}
            onWithdraw={openWithdraw}
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
          <DepositTooltip stretch variant={isV2 ? 'v2' : undefined} onDeposit={openDeposit} />
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
