import { formatUsdcAmount } from '@/utils/format'

export const EARN_PROGRESS_STEPS = ['Amount', 'Review', 'Confirm'] as const

export type EarnTab = 'add' | 'withdraw'

/** Desktop: amount → review → … Mobile keypad: choose → amount → review → … */
export type EarnModalStep = 'choose' | 'amount' | 'review' | 'processing' | 'confirmed'

export const EARN_TABS: ReadonlyArray<{ id: EarnTab; label: string }> = [
  { id: 'add', label: 'Add funds' },
  { id: 'withdraw', label: 'Withdraw' },
]

/** Demo vault APY — matches BalanceCard ellipses menu meta. */
export const DEMO_EARN_APY = 4.2

/** True when Earn should open the chooser sheet first (`?keypad=1` + mobile). */
export function shouldOpenEarnChooser(search = window.location.search): boolean {
  const value = new URLSearchParams(search).get('keypad')
  const keypadOn = value === '1' || value === 'true'
  if (!keypadOn || typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}
export const EARN_PROCESSING_STAGES = [
  { id: 'build-proof', label: 'Preparing transaction' },
  { id: 'submit-relayer', label: 'Submitting privately' },
] as const

export function earnFinalStageLabel(tab: EarnTab): string {
  return tab === 'add' ? 'Earning' : 'Returned to balance'
}

export function earnAmountQuestion(tab: EarnTab): string {
  return tab === 'add'
    ? 'How much USDC do you want to add to the vault?'
    : 'How much USDC do you want to withdraw from the vault?'
}

export function earnReviewTitle(tab: EarnTab): string {
  return tab === 'add' ? 'Review your deposit' : 'Review your withdrawal'
}

export function earnConfirmLabel(tab: EarnTab): string {
  return tab === 'add' ? 'Confirm deposit' : 'Confirm withdrawal'
}

export function earnConfirmedTitle(tab: EarnTab): string {
  return tab === 'add' ? 'Deposit to vault complete' : 'Withdrawal from vault complete'
}

export function earnProcessingTitle(tab: EarnTab): string {
  return tab === 'add' ? 'Deposit to vault in progress' : 'Withdrawal from vault in progress'
}

export function formatDemoApy(apy: number): string {
  if (apy <= 0) return 'Unavailable'
  return `~${apy.toFixed(1)}%`
}

/** Demo accrued yield for vault bar — ~30 days at the quoted APY. */
export function estimateVaultEarnedSoFar(
  balance: number,
  apy: number = DEMO_EARN_APY,
  daysAccrued = 30,
): number {
  if (balance <= 0 || apy <= 0) return 0
  return balance * (apy / 100) * (daysAccrued / 365)
}

export function formatVaultEarningLabel(apy: number): string {
  return `Earning ${apy.toFixed(1)}% APR`
}

export function formatEarnedSoFarAmount(value: number): string {
  if (value <= 0) return '+0'
  return `+${formatUsdcAmount(value)}`
}
