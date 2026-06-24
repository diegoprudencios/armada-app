export const EARN_PROGRESS_STEPS = ['Amount', 'Review', 'Confirm'] as const

export type EarnTab = 'add' | 'withdraw'

export type EarnModalStep = 'amount' | 'review' | 'processing' | 'confirmed'

export const EARN_TABS: ReadonlyArray<{ id: EarnTab; label: string }> = [
  { id: 'add', label: 'Add funds' },
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
