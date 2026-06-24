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
import styles from './DepositConfirmedScreen.module.css'

const TOKEN_BADGE_PX = 40
/** @web3icons branded assets use an 18px circle in a 24px viewBox — scale up to fill the badge. */
const TOKEN_ICON_SIZE = Math.round((TOKEN_BADGE_PX * 24) / 18)

export interface DepositConfirmedScreenProps {
  amount: string
  networkName: string
  walletAddress?: string
  walletProvider?: string
  armadaAddress?: string
  onViewExplorer: () => void
  onGoToDashboard: () => void
}

export function DepositConfirmedScreen({
  amount,
  networkName,
  walletAddress,
  walletProvider,
  armadaAddress,
  onViewExplorer,
  onGoToDashboard,
}: DepositConfirmedScreenProps) {
  const amountNum = parseActiveAmount(amount)
  const feeUsdc = calculateDepositFee(amountNum)
  const amountLabel = formatUsdcAmount(amountNum)

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
        <h1 className={styles.title}>Deposit confirmed</h1>

        <div className={styles.amountRow}>
          <div className={styles.amountGroup}>
            <div className={styles.tokenBadge} aria-hidden>
              <TokenUSDC size={TOKEN_ICON_SIZE} variant="branded" className={styles.tokenBadgeIcon} />
            </div>
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
        />
      </div>

      <div className={`${styles.buttonRow} ${modalActionRowEnter}`}>
          <Button
            variant="secondary"
            size="lg"
            label="View on explorer"
            showIcon={false}
            onClick={onViewExplorer}
          />
          <Button
            variant="gradient"
            size="lg"
            label="Go to dashboard"
            showIcon={false}
            onClick={onGoToDashboard}
          />
        </div>
    </div>
  )
}
