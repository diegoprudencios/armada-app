import { getCurrentEnvironment } from './environment'

// PLACEHOLDER — Diego hasn't decided yet if this should be flat or
// percentage-based. Using a flat rate for now since it's simplest to
// swap later. DO NOT treat this as final, it's explicitly a stand-in.
const MOCK_FLAT_FEE_USDC = 2

export function calculateDepositFee(amount: number): number {
  const env = getCurrentEnvironment()
  if (env === 'sepolia') {
    // Stub — real fee calculation (gas estimation, protocol fee, etc.)
    // not implemented yet. Falls back to the same mock logic for now.
    return MOCK_FLAT_FEE_USDC
  }
  return MOCK_FLAT_FEE_USDC
}
