import type { BalanceRollMode } from '@/components/RollingBalanceValue'
import type { EarnModalStep, EarnTab } from '@/pages/earnFlowConstants'
import type { RequestModalStep } from '@/pages/requestFlowConstants'
import type { WithdrawModalStep } from '@/pages/withdrawFlowConstants'

export type DepositStep = 'amount' | 'review' | 'wallet' | 'processing' | 'confirmed'
export type SendStep = 'recipient' | 'amount' | 'review' | 'processing' | 'confirmed'
export type EarnStep = EarnModalStep
export type WithdrawStep = WithdrawModalStep
export type RequestStep = RequestModalStep
export type ReceivePaymentStep = 'confirmed'

export type BalanceRollState = {
  trigger: number
  mode: BalanceRollMode
  fromValue?: string
  vaultFromValue?: string
}
