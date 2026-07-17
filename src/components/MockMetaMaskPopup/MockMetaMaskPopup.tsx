import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { WalletMetamask } from '@web3icons/react'
import { registerNestedDialog } from '@/hooks/nestedDialog'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { useRestoreFocus } from '@/hooks/useRestoreFocus'
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
  const popupRef = useRef<HTMLDivElement>(null)
  const rejectButtonRef = useRef<HTMLButtonElement>(null)
  const isMobile = useMobileLayout()
  const isApprove = prompt === 'approve'
  const confirmLabel = isApprove ? 'Approve' : 'Confirm'
  const rejectLabel = 'Reject'
  const title = isApprove ? 'Spending cap request' : 'Transaction request'
  const accountLabel = accountAddress ? truncateAddress(accountAddress) : 'Account 1'

  useRestoreFocus(true)
  useEscapeKey(onReject)
  useFocusTrap(popupRef)

  useEffect(() => registerNestedDialog(), [])
  useEffect(() => {
    rejectButtonRef.current?.focus({ preventScroll: true })
  }, [prompt])

  const popup = (
    <div
      ref={popupRef}
      className={[styles.popup, isMobile && styles.popupSheet].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      onClick={(event) => event.stopPropagation()}
    >
      {isMobile ? (
        <div className={styles.handleRow} aria-hidden>
          <span className={styles.handle} />
        </div>
      ) : null}

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
        <button
          ref={rejectButtonRef}
          type="button"
          className={styles.rejectButton}
          onClick={onReject}
        >
          {rejectLabel}
        </button>
        <button type="button" className={styles.confirmButton} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </footer>
    </div>
  )

  if (isMobile) {
    return createPortal(
      <div className={styles.scrim} role="presentation" onClick={onReject}>
        {popup}
      </div>,
      document.body,
    )
  }

  return createPortal(popup, document.body)
}
