import type { Ref } from 'react'
import {
  AmountInputScreen,
  type AmountInputEntryMode,
} from '@/components/AmountInputScreen'
import { AMOUNT_EXCEEDS_BALANCE_MESSAGE } from '@/utils/amountFieldA11y'
import { calculateSendFee } from '@/utils/sendFee'
import flowStep from '@/styles/modalFlowStep.module.css'
import {
  DEMO_EARN_APY,
  EARN_TABS,
  earnAmountQuestion,
  formatDemoApy,
  type EarnTab,
} from './earnFlowConstants'
import styles from './EarnAmountScreen.module.css'

export interface EarnAmountScreenProps {
  tab: EarnTab
  balance: number
  amount: string
  apy?: number
  /** Default `input` keeps the current system-keyboard UI. */
  entryMode?: AmountInputEntryMode
  /** Mobile keypad: mode is chosen in the Earn sheet — hide Add/Withdraw tabs. */
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
    <div className={styles.tabs} role="tablist" aria-label="Earn mode">
      {EARN_TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={tab === item.id}
          className={[styles.tab, tab === item.id && styles.tabActive].filter(Boolean).join(' ')}
          onClick={() => handleTabChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )

  const footerSlot =
    tab === 'add' && entryMode !== 'keypad' ? (
      <div className={styles.apyBlock}>
        <span className={styles.apyLabel}>Estimated APY</span>
        <span className={styles.apyValue}>{formatDemoApy(apy)}</span>
        <p className={styles.apyCaveat}>
          Based on the vault&apos;s recent rate; the actual yield earned will vary.
        </p>
      </div>
    ) : null

  return (
    <AmountInputScreen
      title={entryMode === 'keypad' ? 'How much USDC?' : earnAmountQuestion(tab)}
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
      footerSlot={footerSlot}
      onAmountChange={onAmountChange}
      onReview={() => onReview(amount)}
      secondaryAction={{ label: hideModeTabs ? 'Back' : 'Cancel', onClick: onCancel }}
    />
  )
}
