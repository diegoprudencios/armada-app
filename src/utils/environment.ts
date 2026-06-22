export const ENV_STORAGE_KEY = 'armada-environment'

export type Environment = 'mock' | 'sepolia'

export function isEnvironment(value: string | null): value is Environment {
  return value === 'mock' || value === 'sepolia'
}

export function getSavedEnvironment(): Environment | null {
  try {
    const saved = localStorage.getItem(ENV_STORAGE_KEY)
    return isEnvironment(saved) ? saved : null
  } catch {
    return null
  }
}

export function getCurrentEnvironment(): Environment {
  return getSavedEnvironment() ?? 'mock'
}

export function setEnvironment(env: Environment): void {
  try {
    localStorage.setItem(ENV_STORAGE_KEY, env)
  } catch {
    // ignore quota / private mode
  }
  window.dispatchEvent(new CustomEvent('environment-change', { detail: env }))
}
