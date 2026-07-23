import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
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
import styles from './DepositReviewScreen.module.css'

const TOKEN_BADGE_PX = 40
/** @web3icons branded assets use an 18px circle in a 24px viewBox — scale up to fill the badge. */
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

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
      <div className={styles.amountGroup}>
        <div className={styles.tokenBadge} aria-hidden>
          <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
        </div>
        <span className={styles.amountValue}>{formatUsdcAmount(amountNum)}</span>
      </div>
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
    // Amount stays on the Deposit screen behind the sheet — don't repeat it here.
    return (
      <div className={styles.sheetColumn}>
        {summary}
        <div className={styles.sheetActions}>
          <Button
            variant="primary"
            size="lg"
            label="Confirm deposit"
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
        <h1 className={styles.title}>Review your deposit</h1>
        {amountBlock}
        {summary}
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
        <Button variant="secondary" size="lg" label="Back" showIcon={false} onClick={onBack} />
        <Button
          variant="primary"
          size="lg"
          label="Confirm deposit"
          showIcon={false}
          onClick={onConfirm}
          testingClickId="deposit_confirm_button"
        />
      </div>
    </div>
  )
}
