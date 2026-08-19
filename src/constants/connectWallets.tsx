import type { ReactNode } from 'react'
import {
  WalletMetamask,
  WalletPhantom,
  WalletWalletConnect,
} from '@web3icons/react'
import type { DemoWalletProvider } from '@/constants/demoWallets'

const CONNECT_WALLET_ICON_SIZE = 24

export const CONNECT_WALLET_OPTIONS: {
  id: DemoWalletProvider
  name: string
  icon: ReactNode
}[] = [
  { id: 'metamask', name: 'MetaMask', icon: <WalletMetamask size={CONNECT_WALLET_ICON_SIZE} /> },
  { id: 'phantom', name: 'Phantom', icon: <WalletPhantom size={CONNECT_WALLET_ICON_SIZE} /> },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: <WalletWalletConnect size={CONNECT_WALLET_ICON_SIZE} />,
  },
]
