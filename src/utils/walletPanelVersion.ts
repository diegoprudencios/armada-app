import { useEffect, useState } from 'react'

export type WalletPanelVersion = 'v1' | 'v2'

const STORAGE_KEY = 'armada-wallet-panel-version'
const VERSION_CHANGE_EVENT = 'wallet-panel-version-change'

function isWalletPanelVersion(value: string | null): value is WalletPanelVersion {
  return value === 'v1' || value === 'v2'
}

export function getWalletPanelVersion(): WalletPanelVersion {
  if (typeof window === 'undefined') return 'v1'

  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return isWalletPanelVersion(saved) ? saved : 'v1'
  } catch {
    return 'v1'
  }
}

export function setWalletPanelVersion(version: WalletPanelVersion): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(STORAGE_KEY, version)
  } catch {
    // ignore quota / private mode
  }

  window.dispatchEvent(new CustomEvent(VERSION_CHANGE_EVENT))
}

export function useWalletPanelVersion(): [WalletPanelVersion, (version: WalletPanelVersion) => void] {
  const [version, setVersion] = useState<WalletPanelVersion>(() => getWalletPanelVersion())

  useEffect(() => {
    const onChange = () => setVersion(getWalletPanelVersion())
    window.addEventListener(VERSION_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(VERSION_CHANGE_EVENT, onChange)
  }, [])

  const update = (next: WalletPanelVersion) => {
    setWalletPanelVersion(next)
    setVersion(next)
  }

  return [version, update]
}
