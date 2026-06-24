import { calculateDepositFee } from './depositFee'

/** Placeholder send fee — same mock logic as deposit until real pricing exists. */
export function calculateSendFee(amount: number): number {
  return calculateDepositFee(amount)
}
