import { useState } from 'react'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import {
  createConnectedWallet,
  demoWalletFromConnected,
  type ConnectedWallet,
} from '@/utils/walletMenu'
import type { DemoWallet } from '@/utils/demoDashboardSession'
import {
  readInitialActiveWalletId,
  readInitialConnectedWallets,
  readInitialWallet,
} from './sessionReaders'

export interface UseDemoWalletSessionOptions {
  onFullSessionReset: () => void
}

export function useDemoWalletSession({ onFullSessionReset }: UseDemoWalletSessionOptions) {
  const [wallet, setWallet] = useState<DemoWallet | null>(readInitialWallet)
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>(readInitialConnectedWallets)
  const [activeWalletId, setActiveWalletId] = useState<string | null>(readInitialActiveWalletId)
  const [connectOpen, setConnectOpen] = useState(false)

  function openConnect() {
    setConnectOpen(true)
  }

  function dismissConnect() {
    setConnectOpen(false)
  }

  function clearWalletState() {
    setWallet(null)
    setConnectedWallets([])
    setActiveWalletId(null)
    setConnectOpen(false)
  }

  function connectWallet(provider: DemoWalletProvider) {
    const nextWallet = createConnectedWallet(provider)
    if (!nextWallet) return

    const existing = connectedWallets.find((entry) => entry.id === nextWallet.id)
    if (existing) {
      setActiveWalletId(existing.id)
      setWallet(demoWalletFromConnected(existing))
      setConnectOpen(false)
      return
    }

    setConnectedWallets([...connectedWallets, nextWallet])
    setActiveWalletId(nextWallet.id)
    setWallet(demoWalletFromConnected(nextWallet))
    setConnectOpen(false)
  }

  function selectActiveWallet(walletId: string) {
    const selected = connectedWallets.find((entry) => entry.id === walletId)
    if (!selected) return

    setActiveWalletId(walletId)
    setWallet(demoWalletFromConnected(selected))
  }

  function activateWallet(walletId: string): boolean {
    const selected = connectedWallets.find((entry) => entry.id === walletId)
    if (!selected) return false

    setActiveWalletId(walletId)
    setWallet(demoWalletFromConnected(selected))
    return true
  }

  function disconnectWallet(walletId?: string) {
    const targetId = walletId ?? activeWalletId
    if (!targetId) {
      onFullSessionReset()
      return
    }

    const next = connectedWallets.filter((entry) => entry.id !== targetId)
    if (next.length === 0) {
      onFullSessionReset()
      return
    }

    const nextActive =
      targetId === activeWalletId
        ? next[0]
        : (next.find((entry) => entry.id === activeWalletId) ?? next[0])

    setConnectedWallets(next)
    setActiveWalletId(nextActive.id)
    setWallet(demoWalletFromConnected(nextActive))
  }

  function requireWallet(): boolean {
    if (wallet) return true
    openConnect()
    return false
  }

  return {
    wallet,
    connectedWallets,
    activeWalletId,
    connectOpen,
    openConnect,
    dismissConnect,
    connectWallet,
    selectActiveWallet,
    activateWallet,
    disconnectWallet,
    clearWalletState,
    requireWallet,
  }
}

export type DemoWalletSession = ReturnType<typeof useDemoWalletSession>
