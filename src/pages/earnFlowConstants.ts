import { formatUsdcAmount } from '@/utils/format'

export const EARN_PROGRESS_STEPS = ['Amount', 'Review', 'Confirm'] as const

export type EarnTab = 'add' | 'withdraw'

/** Amount → review → confirm (desktop and mobile). */
export type EarnModalStep = 'amount' | 'review' | 'processing' | 'confirmed'

export const EARN_TABS: ReadonlyArray<{ id: EarnTab; label: string }> = [
  { id: 'add', label: 'Add to vault' },
  { id: 'withdraw', label: 'Withdraw' },
]

/** Demo vault APY — matches BalanceCard ellipses menu meta. */
export const DEMO_EARN_APY = 4.2

export const EARN_PROCESSING_STAGES = [
  { id: 'build-proof', label: 'Preparing transaction' },
  { id: 'submit-relayer', label: 'Submitting privately' },
] as const

export function earnFinalStageLabel(tab: EarnTab): string {
  return tab === 'add' ? 'Earning' : 'Returned to balance'
}

export function earnAmountQuestion(tab: EarnTab): string {
  return tab === 'add'
    ? 'Add USDC to the shielded vault'
    : 'Withdraw USDC from the shielded vault'
}

export function earnReviewTitle(tab: EarnTab): string {
  return tab === 'add'
    ? 'Review USDC shielded transfer to the vault'
    : 'Review USDC withdraw from shielded vault'
}

export function earnConfirmLabel(tab: EarnTab): string {
  return tab === 'add' ? 'Confirm deposit' : 'Confirm withdrawal'
}

export function earnPrivacyNotice(tab: EarnTab): { title: string; body: string } {
  return {
    title: 'Private transfer.',
    body:
      tab === 'add'
        ? "You are sending to Armada's shielded vault"
        : 'You are withdrawing to your shielded address',
  }
}

export function earnConfirmedTitle(tab: EarnTab): string {
  return tab === 'add' ? 'USDC shielded transfer to vault complete' : 'USDC withdrawal complete'
}

export function earnProcessingTitle(tab: EarnTab): string {
  return tab === 'add'
    ? 'Deposit to shielded vault in progress'
    : 'Withdraw from shielded vault in progress'
}

export function formatDemoApy(apy: number): string {
  if (apy <= 0) return 'Unavailable'
  return `~${apy.toFixed(1)}%`
}

export function earnApyBannerHeadline(apy: number = DEMO_EARN_APY): string {
  return `Earn ${formatDemoApy(apy)} APY`
}

export const EARN_APY_BANNER_BODY =
  "Add USDC to Armada's shielded vault and start earning now."

export const EARN_APY_BANNER_TOOLTIP =
  'The APY is an estimate from recent shielded vault performance.'

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
