import { useEffect } from 'react'
import { LANDING_PATH } from '@/utils/appNavigation'

export function useRequireConnectedWallet(wallet: unknown) {
  useEffect(() => {
    if (!wallet) {
      window.location.replace(LANDING_PATH)
    }
  }, [wallet])
}
