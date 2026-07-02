/** Protocol fee on shielded pool deposits (0.5%). */
export const DEPOSIT_FEE_RATE = 0.005

export function calculateDepositFee(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return amount * DEPOSIT_FEE_RATE
}

/** Total USDC required from the wallet for a deposit (principal + fee). */
export function depositTotalCost(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return amount + calculateDepositFee(amount)
}

/** Largest deposit amount that still leaves enough wallet balance to cover the fee. */
export function maxDepositAmount(balance: number): number {
  if (!Number.isFinite(balance) || balance <= 0) return 0
  const raw = balance / (1 + DEPOSIT_FEE_RATE)
  return Math.floor(raw * 100) / 100
}

/** True when deposit principal + fee exceeds the available wallet balance. */
export function depositAmountExceedsBalance(amount: number, balance: number): boolean {
  if (!Number.isFinite(amount) || amount <= 0) return false
  if (!Number.isFinite(balance) || balance <= 0) return true
  return Math.round(depositTotalCost(amount) * 100) > Math.round(balance * 100)
}
