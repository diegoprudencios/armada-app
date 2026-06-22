import { useCallback, useSyncExternalStore } from 'react'
import {
  ENV_STORAGE_KEY,
  getCurrentEnvironment,
  setEnvironment,
  type Environment,
} from '@/utils/environment'

function subscribeToEnvironment(onStoreChange: () => void) {
  const onEnvironmentChange = () => onStoreChange()
  const onStorage = (event: StorageEvent) => {
    if (event.key === ENV_STORAGE_KEY) onStoreChange()
  }

  window.addEventListener('environment-change', onEnvironmentChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener('environment-change', onEnvironmentChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function useEnvironment() {
  const environment = useSyncExternalStore(
    subscribeToEnvironment,
    getCurrentEnvironment,
    () => 'mock' as Environment,
  )
  const applyEnvironment = useCallback((next: Environment) => setEnvironment(next), [])
  return [environment, applyEnvironment] as const
}
