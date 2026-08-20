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
import styles from './ConfirmedScreen.module.css'

export interface DepositConfirmedScreenProps {
  amount: string
  networkName: string
  walletAddress?: string
  walletProvider?: string
  armadaAddress?: string
  confirmedAt: number
  onViewExplorer: () => void
  onGoToDashboard: () => void
}

export function DepositConfirmedScreen({
  amount,
  networkName,
  walletAddress,
  walletProvider,
  armadaAddress,
  confirmedAt,
  onViewExplorer,
  onGoToDashboard,
}: DepositConfirmedScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const feeUsdc = calculateDepositFee(amountNum)
  const amountLabel = formatUsdcAmount(amountNum)

  return (
    <div className={styles.column}>
      <div className={`${styles.body} ${modalStepBodyEnter}`}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>USDC shield confirmed</h1>
          <div className={styles.amountRow}>
            <span className={styles.amountValue}>{amountLabel}</span>
          </div>
        </div>

        <DepositReviewSummary
          networkName={networkName}
          amount={amountNum}
          feeUsdc={feeUsdc}
          walletAddress={walletAddress ?? DEMO_WALLET_ADDRESS}
          walletProvider={walletProvider}
          armadaAddress={armadaAddress ?? DEMO_ARMADA_ADDRESS}
          confirmedAt={confirmedAt}
        />
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
          <Button
            variant="secondary"
            size="lg"
            label="View on explorer"
            showIcon={false}
            className={styles.cancelButton}
            onClick={onViewExplorer}
          />
          <Button
            variant="primary"
            size="lg"
            label="Go to dashboard"
            showIcon={false}
            className={styles.confirmButton}
            onClick={onGoToDashboard}
          />
        </div>
    </div>
  )
}
