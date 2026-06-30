import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRightOnRectangleIcon,
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
import { BalanceScrambleValue } from '@/components/BalanceScrambleValue'
import balanceCardStyles from '@/components/BalanceCard/BalanceCard.module.css'
import { IconButton } from '@/components/IconButton'
import iconButtonStyles from '@/components/IconButton/IconButton.module.css'
import { SendButton } from '@/components/SendButton'
import { Tag } from '@/components/Tag'
import { Tooltip } from '@/components/Tooltip'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { WalletProviderIcon } from '@/components/WalletPillMenu/WalletPillMenu'
import {
  WALLET_PANEL_ETHEREUM_CHAIN,
  WALLET_PANEL_ETHEREUM_NETWORK_LABEL,
  ethereumUsdcBalanceForWallet,
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
  const ethereumBalance = wallet ? ethereumUsdcBalanceForWallet(wallet.id) : 0
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
      <div className={styles.walletMenuPanel}>
        {showClose ? (
          <div className={styles.ethereumPanelToolbar}>
            <button type="button" className={styles.closeButton} aria-label="Close wallet menu" onClick={onClose}>
              <XMarkIcon width={20} height={20} strokeWidth={2} aria-hidden />
            </button>
          </div>
        ) : null}

        <div className={styles.ethereumPanelBody}>
          {wallet ? (
            <div className={styles.ethereumPanelContent}>
              <div className={styles.ethereumWalletIdentity}>
                <span className={styles.ethereumWalletHeroIcon} aria-hidden>
                  <WalletProviderIcon provider={wallet.provider} size={ETHEREUM_WALLET_HERO_ICON_SIZE} />
                </span>
                <p className={styles.ethereumWalletAddress}>{truncateAddress(wallet.address)}</p>
                <Tag label={WALLET_PANEL_ETHEREUM_NETWORK_LABEL} />
              </div>

              <div className={styles.ethereumActionRow}>
                <WalletActionTooltip label={balanceHidden ? 'Show balance' : 'Hide balance'}>
                  <IconButton
                    variant="secondary"
                    icon={
                      balanceHidden ? (
                        <EyeSlashIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} aria-hidden />
                      ) : (
                        <EyeIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} aria-hidden />
                      )
                    }
                    aria-label={balanceHidden ? 'Show balance' : 'Hide balance'}
                    aria-pressed={balanceHidden}
                    onClick={() => onBalanceHiddenChange?.(!balanceHidden)}
                  />
                </WalletActionTooltip>

                <WalletActionTooltip label={copied ? 'Copied' : 'Copy address'}>
                  <IconButton
                    variant="secondary"
                    icon={
                      copied ? (
                        <CheckIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} aria-hidden />
                      ) : (
                        <ClipboardDocumentIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} />
                      )
                    }
                    aria-label={copied ? 'Address copied' : 'Copy wallet address'}
                    onClick={() => void handleCopy()}
                  />
                </WalletActionTooltip>

                <WalletActionTooltip label="View on explorer">
                  <ExplorerIconLink href={ethereumExplorerAddressUrl(wallet.address)} />
                </WalletActionTooltip>

                <WalletActionTooltip label="Disconnect">
                  <IconButton
                    variant="secondary"
                    icon={<ArrowRightOnRectangleIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} />}
                    aria-label="Disconnect wallet"
                    onClick={() => onDisconnectWallet(wallet.id)}
                  />
                </WalletActionTooltip>
              </div>

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

              <SendButton
                variant="gradient"
                label="DEPOSIT"
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

function WalletActionTooltip({ label, children }: { label: string; children: ReactNode }) {
  const isMobile = useMobileLayout()

  if (isMobile) return children

  return <Tooltip variant="action" content={label}>{children}</Tooltip>
}

function ExplorerIconLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View wallet on explorer"
      className={[iconButtonStyles.button, iconButtonStyles.secondary].join(' ')}
    >
      <span className={iconButtonStyles.icon} aria-hidden>
        <ArrowTopRightOnSquareIcon className={balanceCardStyles.actionIcon} strokeWidth={1.5} />
      </span>
    </a>
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
