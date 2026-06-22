import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { DepositChainId } from '@/components/DepositAmountCard'
import { BalanceCard } from '@/components/BalanceCard'
import { DASHBOARD_TOOLTIP_ENTER_DELAY_MS } from '@/components/BalanceCard/balanceRevealMotion'
import type { BalanceRollMode } from '@/components/RollingBalanceValue'
import { ConnectWalletOverlay } from '@/components/ConnectWalletOverlay'
import { DashboardHeader } from '@/components/DashboardHeader'
import { DepositTooltip } from '@/components/DepositTooltip'
import { useEnvironment } from '@/hooks/useEnvironment'
import { parseActiveAmount } from '@/utils/amountInput'
import { formatUsdcAmount } from '@/utils/format'
import {
  readDemoDashboardSession,
  writeDemoDashboardSession,
  type DemoWallet,
} from '@/utils/demoDashboardSession'
import { getCurrentEnvironment } from '@/utils/environment'
import { DepositModalFlow } from './DepositModalFlow'
import {
  DEMO_WALLET_ADDRESS,
  DEPOSIT_WALLET_BALANCE,
  resolveDemoWalletAddress,
  type DemoWalletProvider,
} from './depositFlowConstants'
import styles from './ArmadaAppDashboard.module.css'

type BalanceRollState = {
  trigger: number
  mode: BalanceRollMode
  fromValue?: string
}

type DepositStep = 'amount' | 'review' | 'wallet' | 'processing' | 'confirmed'

function createDefaultWallet(): DemoWallet {
  return { address: DEMO_WALLET_ADDRESS, provider: 'metamask' }
}

function readInitialWallet(): DemoWallet | null {
  if (getCurrentEnvironment() === 'mock') {
    return readDemoDashboardSession()?.wallet ?? createDefaultWallet()
  }
  return createDefaultWallet()
}

function readInitialBalance(fallback: number): number {
  if (getCurrentEnvironment() === 'mock') {
    return readDemoDashboardSession()?.balance ?? fallback
  }
  return fallback
}

function readInitialHasCompletedDeposit(): boolean {
  if (getCurrentEnvironment() === 'mock') {
    return readDemoDashboardSession()?.hasCompletedDeposit ?? false
  }
  return false
}

export interface ArmadaAppDashboardProps {
  balance?: number
  onSend?: () => void
  onRequest?: () => void
  onMore?: () => void
}

export function ArmadaAppDashboard({
  balance: initialBalance = 0,
  onSend,
  onRequest,
  onMore,
}: ArmadaAppDashboardProps) {
  const [environment] = useEnvironment()
  const isMock = environment === 'mock'

  const [wallet, setWallet] = useState<DemoWallet | null>(readInitialWallet)
  const [dashboardBalance, setDashboardBalance] = useState(() => readInitialBalance(initialBalance))
  const [hasCompletedDeposit, setHasCompletedDeposit] = useState(readInitialHasCompletedDeposit)
  const [connectOpen, setConnectOpen] = useState(false)
  const [depositStep, setDepositStep] = useState<DepositStep | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositChain, setDepositChain] = useState<DepositChainId>('sepolia')
  const [balanceRoll, setBalanceRoll] = useState<BalanceRollState>({
    trigger: 0,
    mode: 'fromZero',
  })
  const pendingDepositRef = useRef(0)

  useEffect(() => {
    if (!isMock) return
    writeDemoDashboardSession({
      wallet,
      balance: dashboardBalance,
      hasCompletedDeposit,
    })
  }, [isMock, wallet, dashboardBalance, hasCompletedDeposit])

  function openConnect() {
    setConnectOpen(true)
  }

  function connectWallet(provider: DemoWalletProvider) {
    const address = resolveDemoWalletAddress(provider)
    if (!address) return

    setWallet({ address, provider })
    setConnectOpen(false)
  }

  function disconnectWallet() {
    setWallet(null)
    setDashboardBalance(initialBalance)
    setHasCompletedDeposit(false)
    setConnectOpen(false)
    closeDeposit()
  }

  function openDeposit() {
    if (!wallet) {
      openConnect()
      return
    }
    setDepositAmount('')
    setDepositChain('sepolia')
    setDepositStep('amount')
  }

  function closeDeposit() {
    setDepositStep(null)
    setDepositAmount('')
    setDepositChain('sepolia')

    const deposited = pendingDepositRef.current
    pendingDepositRef.current = 0

    if (deposited > 0) {
      const fromValue = formatUsdcAmount(dashboardBalance)
      setDashboardBalance((prev) => prev + deposited)
      setBalanceRoll((roll) => ({
        trigger: roll.trigger + 1,
        mode: 'fromValue',
        fromValue,
      }))
    }
  }

  function completeDeposit() {
    const deposited = parseActiveAmount(depositAmount)
    if (deposited > 0) {
      pendingDepositRef.current = deposited
    }
    setHasCompletedDeposit(true)
  }

  const showDepositTooltip = Boolean(wallet) && !hasCompletedDeposit

  return (
    <div className={styles.shell}>
      <div className={styles.headerBand}>
        <DashboardHeader
          wallet={wallet}
          usdcBalance={dashboardBalance}
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
          onSend={onSend}
          onDeposit={openDeposit}
          onRequest={onRequest}
          onMore={onMore}
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

      {connectOpen ? (
        <ConnectWalletOverlay onSelect={connectWallet} />
      ) : null}

      {depositStep ? (
        <DepositModalFlow
          step={depositStep}
          amount={depositAmount}
          chain={depositChain}
          depositWalletBalance={Number(DEPOSIT_WALLET_BALANCE)}
          walletAddress={wallet?.address}
          walletProvider={wallet?.provider}
          onClose={closeDeposit}
          onAmountChange={setDepositAmount}
          onAmountReview={(nextAmount, nextChain) => {
            setDepositAmount(nextAmount)
            setDepositChain(nextChain)
            setDepositStep('review')
          }}
          onReviewBack={() => setDepositStep('amount')}
          onReviewConfirm={() => setDepositStep('wallet')}
          onWalletComplete={() => setDepositStep('processing')}
          onProcessingCancel={() => setDepositStep('review')}
          onProcessingComplete={() => setDepositStep('confirmed')}
          onConfirmedGoToDashboard={completeDeposit}
        />
      ) : null}
    </div>
  )
}
