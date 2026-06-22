export type DemoWalletId = 'metamask' | 'phantom' | 'walletconnect'

/** Demo wallet constants (inlined from crowdfund myPositionDemo — MyPosition not copied). */
const DEMO_WALLET = '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a3c'
const DEMO_WALLET_DISPLAY = '0x1a2b...9a3c'

/** Addresses allowed to participate in the demo crowdfund. */
const WHITELISTED_ADDRESSES = new Set([DEMO_WALLET.toLowerCase()])

/**
 * Demo: each provider resolves to a fixed address after the user approves connection.
 * Only the whitelisted address can proceed.
 */
export const DEMO_ADDRESS_BY_PROVIDER: Record<DemoWalletId, string> = {
  metamask: DEMO_WALLET,
  phantom: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  walletconnect: '0x8ba1f109551bD432803012645Ac136c22C929e',
}

export const DEMO_WHITELISTED_DISPLAY = DEMO_WALLET_DISPLAY

export function resolveDemoAddressForProvider(provider: string): string | null {
  if (provider in DEMO_ADDRESS_BY_PROVIDER) {
    return DEMO_ADDRESS_BY_PROVIDER[provider as DemoWalletId]
  }
  return null
}

export function isAddressWhitelisted(address: string): boolean {
  return WHITELISTED_ADDRESSES.has(address.toLowerCase())
}

export function isProviderWhitelisted(provider: string): boolean {
  const address = resolveDemoAddressForProvider(provider)
  return address != null && isAddressWhitelisted(address)
}

export function truncateWalletAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
