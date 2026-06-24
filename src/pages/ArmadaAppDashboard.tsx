import { type CSSProperties } from 'react'
import { BalanceCard } from '@/components/BalanceCard'
import { DASHBOARD_TOOLTIP_ENTER_DELAY_MS } from '@/components/BalanceCard/balanceRevealMotion'
import { DashboardHeader } from '@/components/DashboardHeader'
import { DepositTooltip } from '@/components/DepositTooltip'
import { useDashboardDemoState } from '@/hooks/useDashboardDemoState'
import { useRequireConnectedWallet } from '@/hooks/useRequireConnectedWallet'
import { DashboardOverlays } from './DashboardOverlays'
import { DEPOSIT_WALLET_BALANCE } from './depositFlowConstants'
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
    openEarn,
    earningBalance,
  } = state

  useRequireConnectedWallet(wallet)

  if (!wallet) return null

  return (
    <div className={styles.shell}>
      <div className={styles.headerBand}>
        <DashboardHeader
          wallet={wallet}
          usdcBalance={Number(DEPOSIT_WALLET_BALANCE)}
          onConnect={openConnect}
          onDisconnect={disconnectWallet}
        />
      </div>
      <div className={styles.cardStack}>
        <BalanceCard
          balance={dashboardBalance}
          balanceRollTrigger={balanceRoll.trigger}
          balanceRollMode={balanceRoll.mode}
          balanceRollFromValue={balanceRoll.fromValue}
          hasCompletedDeposit={hasCompletedDeposit}
          onSend={onSend ?? openSend}
          onDeposit={openDeposit}
          onRequest={onRequest}
          onMore={onMore}
          onEarn={() => openEarn('add')}
          vaultBalance={earningBalance}
          vaultRollFromValue={balanceRoll.vaultFromValue}
          onVaultOpen={() => openEarn('add')}
        />
        {showDepositTooltip ? (
          <div
            className={styles.tooltipEnter}
            style={
              {
                '--dashboard-tooltip-enter-delay': `${DASHBOARD_TOOLTIP_ENTER_DELAY_MS}ms`,
              } as CSSProperties
            }
          >
            <DepositTooltip />
          </div>
        ) : null}
      </div>

      <DashboardOverlays state={state} />
    </div>
  )
}
