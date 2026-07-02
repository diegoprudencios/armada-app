import { formatUsdcAmount } from './format'

export function formatProtocolFeeLabel(feeUsdc: number): string {
  const resolved = Number.isFinite(feeUsdc) && feeUsdc > 0 ? feeUsdc : 0
  return `${formatUsdcAmount(resolved, 2)} USDC`
}
