import { useEffect, useRef, useState } from 'react'
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
import NetworkEthereum from '@web3icons/react/icons/networks/NetworkEthereum'
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
  WALLET_PANEL_ETHEREUM_CHAIN,
  WALLET_PANEL_ETHEREUM_NETWORK_LABEL,
} from '@/constants/walletMenu'
import { formatUsdcAmount, truncateAddress } from '@/utils/format'
import type { WalletMenuPanelProps } from './WalletMenuPanel'
import styles from './WalletMenuPanel.module.css'

const ETHEREUM_WALLET_HERO_ICON_SIZE = 56
const ETHEREUM_USDC_ROW_ICON_PX = 40
const ETHEREUM_USDC_ROW_ICON_SIZE = Math.round((ETHEREUM_USDC_ROW_ICON_PX * 24) / 18)

function ethereumExplorerAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`
}

export function WalletMenuPanelEthereum({
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
  const ethereumBalance = wallet?.usdcBalance ?? 0
  const balanceLabel = formatUsdcAmount(ethereumBalance)

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
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleDeposit = () => {
    if (!wallet) return
    onDeposit(wallet.id, WALLET_PANEL_ETHEREUM_CHAIN)
    onClose?.()
  }

  return (
    <div className={styles.scrollContent}>
      <div className={`${styles.walletMenuPanel} ${styles.walletMenuPanelEthereum}`}>
        {showClose ? (
          <IconButton
            variant="frosted"
            size="sm"
            className={styles.ethereumPanelClose}
            aria-label="Close wallet menu"
            icon={<XMarkIcon strokeWidth={2} />}
            onClick={onClose}
          />
        ) : null}
        <div className={styles.ethereumPanelBody}>
          {wallet ? (
            <div className={styles.ethereumPanelContent}>
              <div className={styles.ethereumWalletCluster}>
                <div className={styles.ethereumWalletIdentity}>
                  <span className={styles.ethereumWalletHeroIcon} aria-hidden>
                    <WalletProviderIcon provider={wallet.provider} size={ETHEREUM_WALLET_HERO_ICON_SIZE} />
                  </span>
                  <p className={styles.ethereumWalletAddress}>{truncateAddress(wallet.address)}</p>
                  <Tag label={WALLET_PANEL_ETHEREUM_NETWORK_LABEL} />
                </div>

                <div className={styles.ethereumActionRow}>
                  <BalanceActionButton
                    label={balanceHidden ? 'Show' : 'Hide'}
                    className={styles.ethereumLabeledAction}
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
                    className={styles.ethereumLabeledAction}
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
                    className={styles.ethereumLabeledAction}
                    icon={<ArrowTopRightOnSquareIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} />}
                    onClick={() => {
                      window.open(
                        ethereumExplorerAddressUrl(wallet.address),
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }}
                  />
                  <BalanceActionButton
                    label="Disconnect"
                    className={styles.ethereumLabeledAction}
                    icon={<PowerIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} />}
                    onClick={() => onDisconnectWallet(wallet.id)}
                  />
                </div>
              </div>

              <div className={styles.ethereumUsdcBlock}>
                <p className={styles.ethereumUsdcLabel}>Your USDC wallet balance</p>
                <div className={styles.ethereumUsdcRow}>
                  <UsdcChainIcon />
                  <div className={styles.tokenIdentity}>
                    <p className={styles.listPrimary}>USDC</p>
                    <p className={styles.listSecondary}>{WALLET_PANEL_ETHEREUM_NETWORK_LABEL}</p>
                  </div>
                  <p className={styles.tokenBalance}>
                    <BalanceScrambleValue value={balanceLabel} revealed={!balanceHidden} />
                  </p>
                </div>
              </div>

              <SendButton
                variant="gradient"
                label="Shield your USDC"
                icon={<PlusIcon className={styles.ethereumDepositButtonIcon} strokeWidth={1.5} />}
                className={styles.ethereumDepositButton}
                onClick={handleDeposit}
              />
            </div>
          ) : (
            <section className={styles.connectedWalletsSection} aria-label="Connect wallet">
              <p className={styles.ethereumDepositHint}>
                Connect an Ethereum wallet to view your balance and deposit USDC.
              </p>
              <ConnectWalletPicker onSelect={onConnectWallet} />
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function UsdcChainIcon() {
  return (
    <span className={styles.ethereumUsdcChainIcon} aria-hidden>
      <TokenUSDC size={ETHEREUM_USDC_ROW_ICON_SIZE} variant="branded" className={styles.ethereumUsdcChainGlyph} />
      <span className={styles.ethereumUsdcChainOverlay}>
        <NetworkEthereum size={16} variant="branded" className={styles.ethereumUsdcChainOverlayGlyph} />
      </span>
    </span>
  )
}
