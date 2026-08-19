export const DEMO_WALLET_ADDRESS = '0x6545454534534534534534534534534534534'

export type DemoWalletProvider = 'metamask' | 'phantom' | 'walletconnect'

export const DEMO_ADDRESS_BY_PROVIDER: Record<DemoWalletProvider, string> = {
  metamask: DEMO_WALLET_ADDRESS,
  phantom: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  walletconnect: '0x8ba1f109551bD432803012645Ac136c22C929e',
}

export function resolveDemoWalletAddress(provider: string): string | null {
  if (provider in DEMO_ADDRESS_BY_PROVIDER) {
    return DEMO_ADDRESS_BY_PROVIDER[provider as DemoWalletProvider]
  }
  return null
}
