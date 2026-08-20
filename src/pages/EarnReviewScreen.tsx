import { Button } from '@/components/Button'
import { EarnReviewSummary } from '@/components/EarnReviewSummary'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { calculateSendFee } from '@/utils/sendFee'
import { formatUsdcAmount } from '@/utils/format'
import {
  DEMO_EARN_APY,
  earnConfirmLabel,
  earnReviewTitle,
  type EarnTab,
} from './earnFlowConstants'
import reviewStyles from './ReviewScreenLayout.module.css'
import styles from './EarnReviewScreen.module.css'

export interface EarnReviewScreenProps {
  tab: EarnTab
  amount: string
  apy?: number
  /** Mobile keypad: compact content for a bottom sheet over the amount screen. */
  keypadMobileLayout?: boolean
  onBack: () => void
  onConfirm: () => void
}

export function EarnReviewScreen({
  tab,
  amount,
  apy = DEMO_EARN_APY,
  keypadMobileLayout = false,
  onBack,
  onConfirm,
}: EarnReviewScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const feeUsdc = calculateSendFee(amountNum)
  const confirmLabel = earnConfirmLabel(tab)

  const amountBlock = (
    <div className={reviewStyles.amountRow}>
      <span className={reviewStyles.amountValue}>{formatUsdcAmount(amountNum)}</span>
    </div>
  )

  const summary = (
    <EarnReviewSummary
      tab={tab}
      amount={amountNum}
      apy={apy}
      feeUsdc={feeUsdc}
      tone={keypadMobileLayout ? 'neutral' : 'default'}
    />
  )

  if (keypadMobileLayout) {
    return (
      <div className={reviewStyles.sheetColumn}>
        {summary}
        {tab === 'withdraw' ? (
          <p className={styles.slippageNotice}>
            The shielded vault rate moves with each new block. Your final USDC may differ slightly from
            this quote.
          </p>
        ) : null}
        <div className={reviewStyles.sheetActions}>
          <Button
            variant="primary"
            size="lg"
            label={confirmLabel}
            showIcon={false}
            onClick={onConfirm}
            testingClickId={
              tab === 'add' ? 'vault_deposit_confirm_button' : 'vault_withdraw_confirm_button'
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className={reviewStyles.column}>
      <div className={`${reviewStyles.body} ${modalStepBodyEnter}`}>
        <div className={reviewStyles.titleBlock}>
          <h1 className={reviewStyles.title}>{earnReviewTitle(tab)}</h1>
          {amountBlock}
        </div>
        {summary}
        {tab === 'withdraw' ? (
          <p className={styles.slippageNotice}>
            The shielded vault rate moves with each new block. Your final USDC may differ slightly from
            this quote.
          </p>
        ) : null}
      </div>

      <div className={`${reviewStyles.buttonRow} ${modalActionRowEnter}`}>
        <Button
          variant="secondary"
          size="lg"
          label="Back"
          showIcon={false}
          className={reviewStyles.cancelButton}
          onClick={onBack}
        />
        <Button
          variant="primary"
          size="lg"
          label={confirmLabel}
          showIcon={false}
          className={reviewStyles.confirmButton}
          onClick={onConfirm}
          testingClickId={
            tab === 'add' ? 'vault_deposit_confirm_button' : 'vault_withdraw_confirm_button'
          }
        />
      </div>
    </div>
  )
}
