import type { Ref } from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import {
  AmountInputScreen,
  type AmountInputEntryMode,
} from '@/components/AmountInputScreen'
import { DepositTooltip } from '@/components/DepositTooltip'
import { SegmentedControl } from '@/components/SegmentedControl'
import { AMOUNT_EXCEEDS_BALANCE_MESSAGE } from '@/utils/amountFieldA11y'
import { calculateSendFee } from '@/utils/sendFee'
import flowStep from '@/styles/modalFlowStep.module.css'
import {
  DEMO_EARN_APY,
  EARN_TABS,
  earnAmountQuestion,
  formatDemoApy,
  earnApyBannerHeadline,
  EARN_APY_BANNER_BODY,
  EARN_APY_BANNER_TOOLTIP,
  type EarnTab,
} from './earnFlowConstants'

export interface EarnAmountScreenProps {
  tab: EarnTab
  balance: number
  amount: string
  apy?: number
  /** Default `input` keeps the current system-keyboard UI. */
  entryMode?: AmountInputEntryMode
  /** Mobile keypad: mode tabs live in the modal header. */
  hideModeTabs?: boolean
  amountInputRef?: Ref<HTMLInputElement>
  onTabChange: (tab: EarnTab) => void
  onAmountChange: (amount: string) => void
  onCancel: () => void
  onReview: (amount: string) => void
}

export function EarnAmountScreen({
  tab,
  balance,
  amount,
  apy = DEMO_EARN_APY,
  entryMode = 'input',
  hideModeTabs = false,
  amountInputRef,
  onTabChange,
  onAmountChange,
  onCancel,
  onReview,
}: EarnAmountScreenProps) {
  function handleTabChange(next: EarnTab) {
    if (next === tab) return
    onTabChange(next)
    onAmountChange('')
  }

  const headerSlot = hideModeTabs ? undefined : (
    <SegmentedControl
      size="sm"
      aria-label="Earn mode"
      value={tab}
      onChange={handleTabChange}
      options={EARN_TABS}
    />
  )

  const introSlot = hideModeTabs ? undefined : (
    <DepositTooltip
      stretch
      BadgeIcon={ChartBarIcon}
      badgeBackground="white"
      iconTileTone="purple"
      headline={earnApyBannerHeadline(apy)}
      ariaLabel={`Estimated yearly yield ${formatDemoApy(apy)}`}
      body={EARN_APY_BANNER_BODY}
      infoTooltip={EARN_APY_BANNER_TOOLTIP}
    />
  )

  return (
    <AmountInputScreen
      title={entryMode === 'keypad' ? 'How much USDC?' : earnAmountQuestion(tab)}
      hideTitle={entryMode === 'keypad'}
      balance={balance}
      amount={amount}
      entryMode={entryMode}
      amountAriaLabel={tab === 'add' ? 'Vault deposit amount' : 'Vault withdrawal amount'}
      exceedMessage={AMOUNT_EXCEEDS_BALANCE_MESSAGE}
      calculateFee={calculateSendFee}
      primaryLabelMode="static"
      focusKey={tab}
      amountInputRef={amountInputRef}
      columnClassName={entryMode === 'keypad' ? undefined : flowStep.column}
      titleClassName={entryMode === 'keypad' ? undefined : flowStep.title}
      headerSlot={headerSlot}
      introSlot={introSlot}
      onAmountChange={onAmountChange}
      onReview={() => onReview(amount)}
      secondaryAction={{ label: 'Cancel', onClick: onCancel }}
    />
  )
}
