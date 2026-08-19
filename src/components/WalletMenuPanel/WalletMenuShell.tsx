import type { DepositChainId } from '@/constants/depositChains'
import { BottomSheet } from '@/components/BottomSheet'
import { SidePanel } from '@/components/SidePanel'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import type { ConnectedWallet } from '@/utils/walletMenu'
import { WalletMenuPanel } from './WalletMenuPanel'
import shellStyles from './WalletMenuShell.module.css'

export interface WalletMenuShellProps {
  open: boolean
  onClose: () => void
  wallets: readonly ConnectedWallet[]
  activeWalletId: string | null
  onDisconnectWallet: (walletId: string) => void
  onConnectWallet: (provider: DemoWalletProvider) => void
  onDeposit: (walletId: string, chain: DepositChainId) => void
  balanceHidden?: boolean
  onBalanceHiddenChange?: (hidden: boolean) => void
}

export function WalletMenuShell({
  open,
  onClose,
  wallets,
  activeWalletId,
  onDisconnectWallet,
  onConnectWallet,
  onDeposit,
  balanceHidden,
  onBalanceHiddenChange,
}: WalletMenuShellProps) {
  const isMobile = useMobileLayout()

  const panel = (
    <WalletMenuPanel
      wallets={wallets}
      activeWalletId={activeWalletId}
      showClose={!isMobile}
      onClose={onClose}
      onDisconnectWallet={onDisconnectWallet}
      onConnectWallet={onConnectWallet}
      onDeposit={onDeposit}
      balanceHidden={balanceHidden}
      onBalanceHiddenChange={onBalanceHiddenChange}
    />
  )

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        ariaLabel="Wallet"
        sheetClassName={shellStyles.shellSheet}
        scrimClassName={shellStyles.shellScrim}
      >
        {panel}
      </BottomSheet>
    )
  }

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      ariaLabel="Wallet"
      panelClassName={shellStyles.shellPanel}
      scrimClassName={shellStyles.shellScrim}
    >
      {panel}
    </SidePanel>
  )
}
