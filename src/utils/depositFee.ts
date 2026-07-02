/** Protocol fee on shielded pool deposits (0.5%). */
export const DEPOSIT_FEE_RATE = 0.005

export function calculateDepositFee(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return amount * DEPOSIT_FEE_RATE
}
