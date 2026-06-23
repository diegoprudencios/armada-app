import { createPortal } from 'react-dom'
import { WalletMetamask } from '@web3icons/react'
import { DEMO_ARMADA_ADDRESS } from '@/pages/depositFlowConstants'
import usdcAmount from '@/styles/usdcAmount.module.css'
import { truncateAddress } from '@/utils/format'
import styles from './MockMetaMaskPopup.module.css'

export type MockMetaMaskPrompt = 'approve' | 'sign'

export interface MockMetaMaskPopupProps {
  prompt: MockMetaMaskPrompt
  amountLabel: string
  networkName?: string
  accountAddress?: string
  onConfirm: () => void
  onReject: () => void
}

export function MockMetaMaskPopup({
  prompt,
  amountLabel,
  networkName = 'Ethereum Sepolia',
  accountAddress,
  onConfirm,
  onReject,
}: MockMetaMaskPopupProps) {
  const isApprove = prompt === 'approve'
  const confirmLabel = isApprove ? 'Approve' : 'Confirm'
  const rejectLabel = 'Reject'
  const title = isApprove ? 'Spending cap request' : 'Transaction request'
  const accountLabel = accountAddress ? truncateAddress(accountAddress) : 'Account 1'

  const popup = (
    <div
      className={styles.popup}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header className={styles.header}>
        <WalletMetamask size={20} aria-hidden />
        <span className={styles.brand}>MetaMask</span>
      </header>

      <div className={styles.body}>
        <div className={styles.accountRow}>
          <div className={styles.accountAvatar} aria-hidden />
          <div className={styles.accountMeta}>
            <span className={styles.accountName}>Account 1</span>
            <span className={styles.accountAddress}>{accountLabel}</span>
          </div>
        </div>

        <div>
          <h2 className={styles.promptTitle}>{title}</h2>
          <p className={styles.siteOrigin}>app.armada.finance</p>
        </div>

        <div className={styles.details}>
          {isApprove ? (
            <>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Token</span>
                <span className={styles.detailValue}>USDC</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Spender</span>
                <span className={styles.detailValue}>{truncateAddress(DEMO_ARMADA_ADDRESS)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Spending cap</span>
                <span className={`${styles.amountValue} ${usdcAmount.font}`}>
                  {amountLabel} USDC
                </span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Network</span>
                <span className={styles.detailValue}>{networkName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Function</span>
                <span className={styles.detailValue}>deposit</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Amount</span>
                <span className={`${styles.amountValue} ${usdcAmount.font}`}>
                  {amountLabel} USDC
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Estimated fee</span>
                <span className={styles.detailValue}>&lt; $0.01</span>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.rejectButton} onClick={onReject}>
          {rejectLabel}
        </button>
        <button type="button" className={styles.confirmButton} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </footer>
    </div>
  )

  return createPortal(popup, document.body)
}
