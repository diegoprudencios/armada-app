import { type CSSProperties } from 'react'
import { DASHBOARD_ACTIVITY_BOTTOM_SPACING_PX } from '@/constants/activityList'
import { BalanceCard } from '@/components/BalanceCard'
import { DASHBOARD_TOOLTIP_ENTER_DELAY_MS } from '@/components/BalanceCard/balanceRevealMotion'
import { DashboardScrollTopFade } from '@/components/DashboardScrollTopFade'
import { DashboardHeader } from '@/components/DashboardHeader'
import { DepositTooltip } from '@/components/DepositTooltip'
import { RecentActivityList } from '@/components/RecentActivityList'
import { useDashboardDemoState } from '@/hooks/useDashboardDemoState'
import { useRequireConnectedWallet } from '@/hooks/useRequireConnectedWallet'
import { DashboardOverlays } from './DashboardOverlays'
import { DashboardCardStack } from './DashboardCardStack'
import { DEPOSIT_WALLET_BALANCE, DEMO_ARMADA_ADDRESS } from './depositFlowConstants'
import styles from './ArmadaAppDashboard.module.css'

export interface ArmadaAppDashboardProps {
  balance?: number
  onSend?: () => void
  onRequest?: () => void
  onMore?: () => void
}

/** Dashboard layout v1 — shared shell with v2; default balance card actions. */
export function ArmadaAppDashboard({
  balance: initialBalance = 0,
  onSend,
  onRequest,
  onMore,
}: ArmadaAppDashboardProps) {
  const state = useDashboardDemoState(initialBalance)
  const {
    wallet,
    dashboardBalance,
    hasCompletedDeposit,
    balanceRoll,
    showDepositTooltip,
    openConnect,
    disconnectWallet,
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

  const showActivity = activityVisible && hasCompletedDeposit

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
          wallet={wallet}
          usdcBalance={Number(DEPOSIT_WALLET_BALANCE)}
          onConnect={openConnect}
          onDisconnect={disconnectWallet}
        />
      </div>
      <DashboardCardStack
        showDepositTooltip={showDepositTooltip}
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
            hasCompletedDeposit={hasCompletedDeposit}
            onSend={onSend ?? openSend}
            onDeposit={openDeposit}
            onRequest={onRequest ?? openRequest}
            onMore={onMore}
            onEarn={() => openEarn('add')}
            onWithdraw={openWithdraw}
            vaultBalance={earningBalance}
            vaultRollFromValue={balanceRoll.vaultFromValue}
            onVaultOpen={() => openEarn('add')}
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
        depositTooltip={<DepositTooltip onDeposit={openDeposit} />}
      />

      <DashboardOverlays state={state} />
    </div>
  )
}
