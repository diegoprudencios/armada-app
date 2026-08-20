import { Button } from '@/components/Button'
import { DepositReviewSummary } from '@/components/DepositReviewSummary'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { parseActiveAmount } from '@/utils/amountInput'
import { calculateDepositFee } from '@/utils/depositFee'
import { formatUsdcAmount } from '@/utils/format'
import {
  DEMO_ARMADA_ADDRESS,
  DEMO_WALLET_ADDRESS,
} from './depositFlowConstants'
import styles from './ReviewScreenLayout.module.css'

export interface DepositReviewScreenProps {
  amount: string
  networkName: string
  walletAddress?: string
  walletProvider?: string
  armadaAddress?: string
  /** Mobile keypad: compact content for a bottom sheet over the amount screen. */
  keypadMobileLayout?: boolean
  onBack: () => void
  onConfirm: () => void
}

export function DepositReviewScreen({
  amount,
  networkName,
  walletAddress,
  walletProvider,
  armadaAddress,
  keypadMobileLayout = false,
  onBack,
  onConfirm,
}: DepositReviewScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const feeUsdc = calculateDepositFee(amountNum)

  const amountBlock = (
    <div className={styles.amountRow}>
      <span className={styles.amountValue}>{formatUsdcAmount(amountNum)}</span>
    </div>
  )

  const summary = (
    <DepositReviewSummary
      networkName={networkName}
      amount={amountNum}
      feeUsdc={feeUsdc}
      walletAddress={walletAddress ?? DEMO_WALLET_ADDRESS}
      walletProvider={walletProvider}
      armadaAddress={armadaAddress ?? DEMO_ARMADA_ADDRESS}
      tone={keypadMobileLayout ? 'neutral' : 'default'}
    />
  )

  if (keypadMobileLayout) {
    // Amount stays on the Shield screen behind the sheet — don't repeat it here.
    return (
      <div className={styles.sheetColumn}>
        {summary}
        <div className={styles.sheetActions}>
          <Button
            variant="primary"
            size="lg"
            label="Confirm shield"
            showIcon={false}
            onClick={onConfirm}
            testingClickId="deposit_confirm_button"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.column}>
      <div className={`${styles.body} ${modalStepBodyEnter}`}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Review your USDC shield</h1>
          {amountBlock}
        </div>
        {summary}
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        <Button
          variant="secondary"
          size="lg"
          label="Back"
          showIcon={false}
          className={styles.cancelButton}
          onClick={onBack}
        />
        <Button
          variant="primary"
          size="lg"
          label="Confirm"
          showIcon={false}
          className={styles.confirmButton}
          onClick={onConfirm}
          testingClickId="deposit_confirm_button"
        />
      </div>
    </div>
  )
}
