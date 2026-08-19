import { useEffect, useRef, useState } from 'react'
import { CLIPBOARD_COPIED_RESET_MS } from '@/constants/clipboard'
import {
  PowerIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { ConnectWalletPicker } from '@/components/ConnectWalletPicker'
import { BalanceActionButton } from '@/components/BalanceActionButton'
import { IconButton } from '@/components/IconButton'
import { BalanceScrambleValue } from '@/components/BalanceScrambleValue'
import balanceCardStyles from '@/components/BalanceCard/BalanceCard.module.css'
import { SendButton } from '@/components/SendButton'
import { Tag } from '@/components/Tag'
import { WalletProviderIcon } from '@/components/WalletPillMenu/WalletPillMenu'
import {
  DEPOSIT_CHAIN_ICONS,
  depositChainLabel,
  explorerAddressUrl,
  type DepositChainId,
} from '@/constants/depositChains'
import type { DemoWalletProvider } from '@/constants/demoWallets'
import type { ConnectedWallet } from '@/utils/walletMenu'
import { formatUsdcAmount, truncateAddress } from '@/utils/format'
import styles from './WalletMenuPanel.module.css'

export interface WalletMenuPanelProps {
  wallets: readonly ConnectedWallet[]
  activeWalletId: string | null
  showClose?: boolean
  onClose?: () => void
  onDisconnectWallet: (walletId: string) => void
  onConnectWallet: (provider: DemoWalletProvider) => void
  onDeposit: (walletId: string, chain: DepositChainId) => void
  balanceHidden?: boolean
  onBalanceHiddenChange?: (hidden: boolean) => void
}

const WALLET_HERO_ICON_SIZE = 56
const USDC_ROW_ICON_PX = 40
const USDC_ROW_ICON_SIZE = Math.round((USDC_ROW_ICON_PX * 24) / 18)

export function WalletMenuPanel({
  wallets,
  activeWalletId,
  showClose = false,
  onClose,
  onDisconnectWallet,
  onConnectWallet,
  onDeposit,
  balanceHidden = false,
  onBalanceHiddenChange,
}: WalletMenuPanelProps) {
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const wallet =
    wallets.find((entry) => entry.id === activeWalletId) ?? wallets[0] ?? null
  const balanceLabel = formatUsdcAmount(wallet?.usdcBalance ?? 0)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const handleCopy = async () => {
    if (!wallet) return

    try {
      await navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), CLIPBOARD_COPIED_RESET_MS)
    } catch {
      setCopied(false)
    }
  }

  const handleDeposit = () => {
    if (!wallet) return
    onDeposit(wallet.id, wallet.chain)
    onClose?.()
  }

  return (
    <div className={styles.panelLayout}>
      <div className={styles.scrollContent}>
        <div className={styles.walletMenuPanel}>
          {showClose ? (
            <IconButton
              variant="frosted"
              size="sm"
              className={styles.panelClose}
              aria-label="Close wallet menu"
              icon={<XMarkIcon strokeWidth={2} />}
              onClick={onClose}
            />
          ) : null}
          <div className={styles.panelBody}>
            {wallet ? (
              <div className={styles.panelContent}>
                <div className={styles.walletCluster}>
                  <div className={styles.walletIdentity}>
                    <span className={styles.walletHeroIcon} aria-hidden>
                      <WalletProviderIcon provider={wallet.provider} size={WALLET_HERO_ICON_SIZE} />
                    </span>
                    <p className={styles.walletAddress}>{truncateAddress(wallet.address)}</p>
                    <Tag label={depositChainLabel(wallet.chain)} />
                  </div>

                  <div className={styles.actionRow}>
                    <BalanceActionButton
                      label={balanceHidden ? 'Show' : 'Hide'}
                      className={styles.labeledAction}
                      icon={
                        balanceHidden ? (
                          <EyeSlashIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} aria-hidden />
                        ) : (
                          <EyeIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} aria-hidden />
                        )
                      }
                      onClick={() => onBalanceHiddenChange?.(!balanceHidden)}
                    />
                    <BalanceActionButton
                      label={copied ? 'Copied' : 'Copy'}
                      className={styles.labeledAction}
                      icon={
                        copied ? (
                          <CheckIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} aria-hidden />
                        ) : (
                          <ClipboardDocumentIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} />
                        )
                      }
                      onClick={() => void handleCopy()}
                    />
                    <BalanceActionButton
                      label="Explorer"
                      className={styles.labeledAction}
                      icon={<ArrowTopRightOnSquareIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} />}
                      onClick={() => {
                        window.open(
                          explorerAddressUrl(wallet.chain, wallet.address),
                          '_blank',
                          'noopener,noreferrer',
                        )
                      }}
                    />
                    <BalanceActionButton
                      label="Disconnect"
                      className={styles.labeledAction}
                      icon={<PowerIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} />}
                      onClick={() => onDisconnectWallet(wallet.id)}
                    />
                  </div>
                </div>

                <div className={styles.usdcBlock}>
                  <p className={styles.usdcLabel}>Your USDC wallet balance</p>
                  <div className={styles.usdcRow}>
                    <UsdcChainIcon chain={wallet.chain} />
                    <div className={styles.tokenIdentity}>
                      <p className={styles.listPrimary}>USDC</p>
                      <p className={styles.listSecondary}>{depositChainLabel(wallet.chain)}</p>
                    </div>
                    <p className={styles.tokenBalance}>
                      <BalanceScrambleValue value={balanceLabel} revealed={!balanceHidden} />
                    </p>
                  </div>
                </div>

                <SendButton
                  variant="gradient"
                  label="Shield your USDC"
                  icon={<PlusIcon className={styles.depositButtonIcon} strokeWidth={1.5} />}
                  className={styles.depositButton}
                  onClick={handleDeposit}
                />
              </div>
            ) : (
              <section className={styles.connectedWalletsSection} aria-label="Connect wallet">
                <p className={styles.connectHint}>
                  Connect a wallet to view your balance and deposit USDC.
                </p>
                <ConnectWalletPicker onSelect={onConnectWallet} />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function UsdcChainIcon({ chain }: { chain: DepositChainId }) {
  const NetworkIcon = DEPOSIT_CHAIN_ICONS[chain]
  return (
    <span className={styles.usdcChainIcon} aria-hidden>
      <TokenUSDC size={USDC_ROW_ICON_SIZE} variant="branded" className={styles.usdcChainGlyph} />
      <span className={styles.usdcChainOverlay}>
        <NetworkIcon size={16} variant="branded" className={styles.usdcChainOverlayGlyph} />
      </span>
    </span>
  )
}
