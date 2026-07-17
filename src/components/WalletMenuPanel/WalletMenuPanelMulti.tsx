import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  ArrowPathIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import { ConnectWalletPicker } from '@/components/ConnectWalletPicker'
import type { DepositChainId } from '@/constants/depositChains'
import { useListboxKeyboard } from '@/hooks/useListboxKeyboard'
import { BalanceScrambleValue } from '@/components/BalanceScrambleValue'
import balanceCardStyles from '@/components/BalanceCard/BalanceCard.module.css'
import { Tag } from '@/components/Tag'
import buttonStyles from '@/components/Button/Button.module.css'
import filterStyles from '@/components/RecentActivityList/ActivityKindFilters.module.css'
import { WalletProviderIcon } from '@/components/WalletPillMenu/WalletPillMenu'
import {
  holdingsForWallets,
  providerLabel,
  walletHoldingBalance,
  type WalletUsdcHolding,
} from '@/constants/walletMenu'
import type { DemoWalletProvider } from '@/pages/depositFlowConstants'
import { chainLabel } from '@/pages/depositFlowConstants'
import { formatUsdcAmount, truncateAddress } from '@/utils/format'
import type { ConnectedWallet } from '@/utils/walletMenu'
import { aggregateUsdcBalance } from '@/utils/walletMenu'
import { useFlipReorder } from '@/hooks/useFlipReorder'
import type { WalletMenuPanelProps } from './WalletMenuPanel'
import styles from './WalletMenuPanel.module.css'

const HEADER_USDC_BADGE_PX = 32
const HEADER_USDC_ICON_SIZE = Math.round((HEADER_USDC_BADGE_PX * 24) / 18)
const TOKEN_HOLDING_ICON_PX = 40
const TOKEN_HOLDING_USDC_ICON_SIZE = Math.round((TOKEN_HOLDING_ICON_PX * 24) / 18)
const TOKEN_HOLDING_WALLET_ICON_PX = 24

export function WalletMenuPanelMulti({
  wallets,
  activeWalletId,
  showClose = false,
  onClose,
  onSelectWallet,
  onDisconnectWallet,
  onConnectWallet,
  onDeposit,
  balanceHidden = false,
  onBalanceHiddenChange,
}: WalletMenuPanelProps) {
  const [tokenWalletFilter, setTokenWalletFilter] = useState('all')
  const [copiedWalletId, setCopiedWalletId] = useState<string | null>(null)
  const balancesSectionId = useId()
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const walletIds = useMemo(() => wallets.map((wallet) => wallet.id), [wallets])
  const totalBalance = aggregateUsdcBalance(wallets)
  const connectedProviderIds = useMemo(() => new Set(wallets.map((wallet) => wallet.provider)), [wallets])

  const sortedWallets = useMemo(() => {
    if (!activeWalletId) return [...wallets]
    const activeIndex = wallets.findIndex((wallet) => wallet.id === activeWalletId)
    if (activeIndex <= 0) return [...wallets]
    const next = [...wallets]
    const [activeWallet] = next.splice(activeIndex, 1)
    next.unshift(activeWallet)
    return next
  }, [wallets, activeWalletId])

  const walletOrderKey = sortedWallets.map((wallet) => wallet.id).join('|')
  const walletListRef = useFlipReorder(walletOrderKey)

  const tokenHoldings = useMemo(() => {
    const holdings = holdingsForWallets(walletIds)
    if (tokenWalletFilter === 'all') return holdings
    return holdings.filter((holding) => holding.walletId === tokenWalletFilter)
  }, [tokenWalletFilter, walletIds])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const handleCopy = async (wallet: ConnectedWallet) => {
    try {
      await navigator.clipboard.writeText(wallet.address)
      setCopiedWalletId(wallet.id)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopiedWalletId(null), 2000)
    } catch {
      setCopiedWalletId(null)
    }
  }

  const walletCountLabel =
    wallets.length === 1 ? truncateAddress(wallets[0]?.address ?? '') : `${wallets.length} Wallets`

  const totalBalanceLabel = formatUsdcAmount(totalBalance)

  return (
    <div className={styles.scrollContent}>
      <div className={styles.walletMenuPanel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderMain}>
            <div className={styles.walletSummaryPill} aria-label={`${wallets.length} connected wallets`}>
              <span className={styles.walletIconStack}>
                {wallets.slice(0, 3).map((wallet) => (
                  <span key={wallet.id} className={styles.walletIconStackItem}>
                    <WalletProviderIcon provider={wallet.provider} size={16} />
                  </span>
                ))}
              </span>
              <span>{walletCountLabel}</span>
            </div>

            <div>
              <div className={styles.balanceRow}>
                <div className={styles.totalBalanceCluster}>
                  <span className={styles.headerUsdcBadge} aria-hidden>
                    <TokenUSDC
                      size={HEADER_USDC_ICON_SIZE}
                      variant="branded"
                      className={styles.headerUsdcIcon}
                    />
                  </span>
                  <p className={styles.totalBalance}>
                    <BalanceScrambleValue value={totalBalanceLabel} revealed={!balanceHidden} />
                  </p>
                </div>
                <div className={styles.balanceActions}>
                  <button
                    type="button"
                    className={`${balanceCardStyles.iconBadge} ${balanceCardStyles.eyeBadge}`}
                    aria-label={balanceHidden ? 'Show balance' : 'Hide balance'}
                    aria-pressed={balanceHidden}
                    onClick={() => onBalanceHiddenChange?.(!balanceHidden)}
                  >
                    {balanceHidden ? (
                      <EyeSlashIcon className={balanceCardStyles.badgeIcon} aria-hidden />
                    ) : (
                      <EyeIcon className={balanceCardStyles.badgeIcon} aria-hidden />
                    )}
                  </button>
                  <button
                    type="button"
                    className={styles.refreshButton}
                    aria-label="Refresh wallet balances"
                    onClick={() => undefined}
                  >
                    <ArrowPathIcon width={18} height={18} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </div>
              <p className={styles.balanceCaption}>Total USDC across connected wallets</p>
            </div>
          </div>

          {showClose ? (
            <button type="button" className={styles.closeButton} aria-label="Close wallet menu" onClick={onClose}>
              <XMarkIcon width={20} height={20} strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>

        <section className={styles.connectedWalletsSection} aria-label="Connected wallets">
          <div className={styles.walletList} ref={walletListRef}>
            {sortedWallets.map((wallet) => (
              <div key={wallet.id} className={styles.walletListItem} data-flip-id={wallet.id}>
                <ConnectedWalletCard
                  wallet={wallet}
                  isActive={wallet.id === activeWalletId}
                  balance={walletHoldingBalance(wallet.id)}
                  copied={copiedWalletId === wallet.id}
                  balanceHidden={balanceHidden}
                  onCopy={() => void handleCopy(wallet)}
                  onSelect={() => onSelectWallet(wallet.id)}
                  onDisconnect={() => onDisconnectWallet(wallet.id)}
                />
              </div>
            ))}
          </div>

          <div className={styles.connectSection}>
            <ConnectWalletPicker
              onSelect={onConnectWallet}
              disabledProviders={connectedProviderIds}
            />
          </div>
        </section>

        <div className={styles.tabBar}>
          <h2 className={styles.balancesHeading} id={balancesSectionId}>
            USDC balances
          </h2>

          <WalletFilterMenu
            value={tokenWalletFilter}
            wallets={wallets}
            onChange={setTokenWalletFilter}
          />
        </div>

        <section className={styles.tabPanel} aria-labelledby={balancesSectionId}>
          <ul className={styles.tokenList}>
            {tokenHoldings.map((holding) => {
              const wallet = wallets.find((entry) => entry.id === holding.walletId)
              if (!wallet) return null

              return (
                <TokenHoldingRow
                  key={holding.id}
                  holding={holding}
                  wallet={wallet}
                  balanceHidden={balanceHidden}
                  onDeposit={() => {
                    onDeposit(holding.walletId, holding.chain)
                    onClose?.()
                  }}
                />
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}

function TokenHoldingIcon({ provider }: { provider?: string }) {
  return (
    <span className={styles.tokenHoldingIcon} aria-hidden>
      <TokenUSDC
        size={TOKEN_HOLDING_USDC_ICON_SIZE}
        variant="branded"
        className={styles.tokenHoldingUsdc}
      />
      <span className={styles.tokenHoldingWallet}>
        <WalletProviderIcon provider={provider} size={TOKEN_HOLDING_WALLET_ICON_PX} />
      </span>
    </span>
  )
}

function WalletFilterMenu({
  value,
  wallets,
  onChange,
}: {
  value: string
  wallets: readonly ConnectedWallet[]
  onChange: (next: string) => void
}) {
  const listboxId = useId()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const selectedWallet = wallets.find((wallet) => wallet.id === value)
  const label =
    value === 'all'
      ? 'All wallets'
      : selectedWallet
        ? `${providerLabel(selectedWallet.provider)} · ${truncateAddress(selectedWallet.address)}`
        : 'All wallets'

  const filterOptions = useMemo(
    () => ['all', ...wallets.map((wallet) => wallet.id)] as const,
    [wallets],
  )

  function selectFilter(next: string) {
    onChange(next)
    setOpen(false)
  }

  const {
    highlightIndex,
    getOptionId,
    activeDescendantId,
    handleTriggerKeyDown,
    handleListboxKeyDown,
  } = useListboxKeyboard({
    open,
    options: filterOptions,
    value,
    onOpenChange: setOpen,
    onSelect: selectFilter,
  })

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div className={styles.filterMenuRoot} ref={rootRef}>
      <button
        type="button"
        className={[
          filterStyles.filterBtn,
          styles.filterMenuTrigger,
          value !== 'all' && filterStyles.filterBtnActive,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={styles.filterMenuLabel}>{label}</span>
        <ChevronDownIcon className={styles.filterMenuChevron} aria-hidden />
      </button>

      {open ? (
        <ul
          id={listboxId}
          className={styles.filterMenuList}
          role="listbox"
          aria-label="Filter by wallet"
          aria-activedescendant={activeDescendantId}
          onKeyDown={handleListboxKeyDown}
        >
          <li role="presentation">
            <button
              type="button"
              id={getOptionId(0)}
              role="option"
              aria-selected={value === 'all'}
              className={[
                styles.filterMenuOption,
                highlightIndex === 0 && styles.filterMenuOptionHighlighted,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => selectFilter('all')}
            >
              All wallets
            </button>
          </li>
          {wallets.map((wallet, walletIndex) => {
            const optionIndex = walletIndex + 1
            return (
            <li key={wallet.id} role="presentation">
              <button
                type="button"
                id={getOptionId(optionIndex)}
                role="option"
                aria-selected={value === wallet.id}
                className={[
                  styles.filterMenuOption,
                  highlightIndex === optionIndex && styles.filterMenuOptionHighlighted,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => selectFilter(wallet.id)}
              >
                {providerLabel(wallet.provider)} · {truncateAddress(wallet.address)}
              </button>
            </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function ConnectedWalletCard({
  wallet,
  isActive,
  balance,
  copied,
  balanceHidden,
  onCopy,
  onSelect,
  onDisconnect,
}: {
  wallet: ConnectedWallet
  isActive: boolean
  balance: number
  copied: boolean
  balanceHidden: boolean
  onCopy: () => void
  onSelect: () => void
  onDisconnect: () => void
}) {
  const balanceLabel = formatUsdcAmount(balance)

  return (
    <article className={styles.walletCard}>
      <div className={styles.walletCardTop}>
        <span className={styles.iconBadge} aria-hidden>
          <WalletProviderIcon provider={wallet.provider} size={20} />
        </span>
        <div className={styles.walletAddressGroup}>
          <p className={styles.listPrimary}>{truncateAddress(wallet.address)}</p>
          <button
            type="button"
            className={styles.copyButton}
            aria-label={copied ? 'Address copied' : 'Copy wallet address'}
            onClick={onCopy}
          >
            {copied ? (
              <CheckIcon width={14} height={14} aria-hidden />
            ) : (
              <ClipboardDocumentIcon width={14} height={14} aria-hidden />
            )}
          </button>
        </div>
        <p className={styles.listAmount}>
          <BalanceScrambleValue value={balanceLabel} revealed={!balanceHidden} />
        </p>
      </div>

      <div className={styles.walletCardBottom}>
        {isActive ? <Tag label="Active" dot="active" /> : null}
        <Tag label="EVM" />
        <div className={styles.walletCardActions}>
          {!isActive ? (
            <button type="button" className={styles.textAction} onClick={onSelect}>
              Select wallet
            </button>
          ) : null}
          <button type="button" className={styles.textAction} onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      </div>
    </article>
  )
}

function TokenHoldingRow({
  holding,
  wallet,
  balanceHidden,
  onDeposit,
}: {
  holding: WalletUsdcHolding
  wallet: ConnectedWallet
  balanceHidden: boolean
  onDeposit: () => void
}) {
  const balanceLabel = formatUsdcAmount(holding.balance)

  return (
    <li className={styles.tokenRow}>
      <button
        type="button"
        className={[buttonStyles.btn, buttonStyles.primary, styles.tokenDeposit].join(' ')}
        onClick={onDeposit}
      >
        Deposit
      </button>
      <div className={styles.tokenRowContent}>
        <TokenHoldingIcon provider={wallet.provider} />
        <div className={styles.tokenIdentity}>
          <p className={styles.listPrimary}>{truncateAddress(wallet.address)}</p>
          <p className={styles.listSecondary}>{chainLabel(holding.chain)}</p>
        </div>
        <p className={styles.tokenBalance}>
          <BalanceScrambleValue value={balanceLabel} revealed={!balanceHidden} />
        </p>
      </div>
    </li>
  )
}
