import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { ArrowRightIcon, ClipboardDocumentIcon, GlobeAltIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { Button } from '@/components/Button'
import iconButtonStyles from '@/components/IconButton/IconButton.module.css'
import { useEnvironment } from '@/hooks/useEnvironment'
import { useListboxKeyboard } from '@/hooks/useListboxKeyboard'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { readRecipientFromClipboard } from '@/utils/clipboardAddress'
import { truncateAddress, truncateMiddleToWidth } from '@/utils/format'
import {
  DEMO_0X_RECIPIENT,
  DEMO_ZK_RECIPIENT,
  isArmadaAddress,
  isPublicAddress,
  isValidRecipientAddress,
  RECENT_SEND_ADDRESSES,
  SEND_CHAIN_OPTIONS,
  sendRecipientTitle,
  type SendChainId,
  type SendFlowVariant,
} from './sendFlowConstants'
import styles from './SendRecipientScreen.module.css'

const NETWORK_ICON_SIZE = 32

export interface SendRecipientScreenProps {
  recipient: string
  chain: SendChainId
  variant?: SendFlowVariant
  showRecentAddresses?: boolean
  onRecipientChange: (recipient: string) => void
  onChainChange: (chain: SendChainId) => void
  onCancel: () => void
  onContinue: () => void
}

export function SendRecipientScreen({
  recipient,
  chain,
  variant = 'send',
  showRecentAddresses = true,
  onRecipientChange,
  onChainChange,
  onCancel,
  onContinue,
}: SendRecipientScreenProps) {
  const inputId = useId()
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const chainRootRef = useRef<HTMLDivElement>(null)
  const chainListboxRef = useRef<HTMLUListElement>(null)
  const clipboardAddressRef = useRef<HTMLSpanElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [clipboardAddress, setClipboardAddress] = useState<string | null>(null)
  const [mockNextIsZeroX, setMockNextIsZeroX] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [fittedAddress, setFittedAddress] = useState(recipient)
  const [fittedClipboardAddress, setFittedClipboardAddress] = useState('')
  const [environment] = useEnvironment()
  const isMobile = useMobileLayout()
  const isMock = environment === 'mock'

  const trimmed = recipient.trim()
  const hasInput = trimmed.length > 0
  const hasAddress = isValidRecipientAddress(trimmed)
  const clipboardPreview = isMock
    ? mockNextIsZeroX
      ? DEMO_0X_RECIPIENT
      : DEMO_ZK_RECIPIENT
    : clipboardAddress
  const showClipboardPaste = !hasInput && Boolean(clipboardPreview)
  const showRecentList = showRecentAddresses && !(isMobile && hasAddress)
  const isPrivate = hasAddress && isArmadaAddress(trimmed)
  const isPublic = hasAddress && isPublicAddress(trimmed)
  const inputDisplayValue = inputFocused ? recipient : fittedAddress
  const selectedChain = SEND_CHAIN_OPTIONS.find((option) => option.id === chain) ?? SEND_CHAIN_OPTIONS[0]
  const SelectedNetworkIcon = selectedChain.Icon
  const chainOptionIds = SEND_CHAIN_OPTIONS.map((option) => option.id)

  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return

    function fitToInputWidth() {
      const el = inputRef.current
      if (!el) return

      if (!trimmed) {
        setFittedAddress(recipient)
        return
      }

      const style = getComputedStyle(el)
      const font = [style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily]
        .filter(Boolean)
        .join(' ')
      setFittedAddress(truncateMiddleToWidth(trimmed, el.clientWidth, font))
    }

    fitToInputWidth()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fitToInputWidth)
    observer.observe(input)
    return () => observer.disconnect()
  }, [trimmed, recipient, hasInput, inputFocused])

  useLayoutEffect(() => {
    if (!showClipboardPaste || !clipboardPreview) {
      setFittedClipboardAddress('')
      return
    }

    const el = clipboardAddressRef.current
    if (!el) return

    function fitClipboardAddress() {
      const node = clipboardAddressRef.current
      if (!node || !clipboardPreview) return
      const style = getComputedStyle(node)
      const font = [style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily]
        .filter(Boolean)
        .join(' ')
      setFittedClipboardAddress(truncateMiddleToWidth(clipboardPreview, node.clientWidth, font))
    }

    fitClipboardAddress()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fitClipboardAddress)
    observer.observe(el)
    return () => observer.disconnect()
  }, [showClipboardPaste, clipboardPreview])

  function selectChain(next: SendChainId) {
    onChainChange(next)
    setMenuOpen(false)
  }

  const {
    highlightIndex: chainHighlightIndex,
    getOptionId: getChainOptionId,
    activeDescendantId: chainActiveDescendantId,
    handleTriggerKeyDown: handleChainTriggerKeyDown,
    handleListboxKeyDown: handleChainListboxKeyDown,
  } = useListboxKeyboard({
    open: menuOpen,
    options: chainOptionIds,
    value: chain,
    onOpenChange: setMenuOpen,
    onSelect: selectChain,
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    chainListboxRef.current?.focus()

    function handlePointerDown(event: PointerEvent) {
      if (!chainRootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [menuOpen])

  useEffect(() => {
    if (isMock || hasInput) {
      return
    }

    let cancelled = false

    async function probeClipboard() {
      const address = await readRecipientFromClipboard()
      if (!cancelled) {
        setClipboardAddress(address)
      }
    }

    void probeClipboard()

    function handleClipboardProbe() {
      void probeClipboard()
    }

    window.addEventListener('focus', handleClipboardProbe)
    document.addEventListener('visibilitychange', handleClipboardProbe)
    return () => {
      cancelled = true
      window.removeEventListener('focus', handleClipboardProbe)
      document.removeEventListener('visibilitychange', handleClipboardProbe)
    }
  }, [isMock, hasInput])

  async function handlePaste() {
    if (isMock) {
      const next = mockNextIsZeroX ? DEMO_0X_RECIPIENT : DEMO_ZK_RECIPIENT
      setMockNextIsZeroX((current) => !current)
      onRecipientChange(next)
      inputRef.current?.blur()
      return
    }

    const address = await readRecipientFromClipboard()
    if (address) {
      onRecipientChange(address)
      inputRef.current?.blur()
    }
  }

  function handleClear() {
    onRecipientChange('')
    inputRef.current?.blur()
  }

  function handleSelectRecent(address: string) {
    onRecipientChange(address)
    inputRef.current?.blur()
  }

  const privacyBadge =
    isPrivate || isPublic ? (
      <div className={`${styles.privacyBadge} ${styles.actionRowReveal}`} role="status">
        <span
          className={[
            styles.privacyIcon,
            isPrivate ? styles.brandBadge : styles.privacyIconPublic,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden
        >
          {isPrivate ? (
            <ArmadaLogo variant="mark" markTone="deep" className={styles.brandMark} />
          ) : (
            <GlobeAltIcon className={styles.privacyIconSvg} strokeWidth={1.75} />
          )}
        </span>
        <div className={styles.privacyCopy}>
          <span className={styles.privacyTitle}>
            {isPrivate ? 'Private address' : 'Public address'}
          </span>
          <span className={styles.privacySubtitle}>
            {isPrivate
              ? 'Transaction will be fully private'
              : "Transfer won't be fully private"}
          </span>
        </div>
      </div>
    ) : null

  const actionRow = (
    <div className={`${styles.buttonRow} ${styles.enterCtas}`}>
      <Button
        variant="secondary"
        size="lg"
        label="Cancel"
        showIcon={false}
        onClick={onCancel}
      />
      <Button
        variant="primary"
        size="lg"
        label={hasAddress ? 'Continue' : 'Enter address'}
        showIcon={false}
        disabled={!hasAddress}
        dimWhenDisabled={false}
        onClick={onContinue}
      />
    </div>
  )

  return (
    <div className={styles.column}>
      <div className={styles.body}>
        <div className={`${styles.card} ${styles.enterCard}`}>
          <h1 className={`armada-text-ui-body-lg ${styles.cardTitle}`}>
            {sendRecipientTitle(variant)}
          </h1>

          <div className={styles.addressBlock}>
          <div className={styles.addressField}>
            <input
              ref={inputRef}
              id={inputId}
              className={styles.addressInput}
              type="text"
              value={inputDisplayValue}
              title={trimmed || undefined}
              onChange={(event) => onRecipientChange(event.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Enter address"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              aria-label="Recipient address"
            />
            {hasInput ? (
              <button
                type="button"
                className={styles.clearButton}
                aria-label="Clear address"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClear}
              >
                <XMarkIcon className={styles.clearIcon} strokeWidth={2} aria-hidden />
              </button>
            ) : null}
          </div>

          {showClipboardPaste && clipboardPreview ? (
            <button
              type="button"
              className={styles.clipboardPaste}
              onClick={() => void handlePaste()}
            >
              <span
                className={[
                  iconButtonStyles.button,
                  iconButtonStyles.sizeMd,
                  iconButtonStyles.frosted,
                  styles.clipboardPasteIcon,
                ].join(' ')}
                aria-hidden
              >
                <span className={iconButtonStyles.icon}>
                  <ClipboardDocumentIcon strokeWidth={1.5} />
                </span>
              </span>
              <span className={styles.clipboardPasteCopy}>
                <span className={styles.clipboardPasteLabel}>Paste from clipboard</span>
                <span
                  ref={clipboardAddressRef}
                  className={styles.clipboardPasteAddress}
                  title={clipboardPreview}
                >
                  {fittedClipboardAddress || clipboardPreview}
                </span>
              </span>
            </button>
          ) : null}

          {isPublic ? (
            <div className={styles.networkRoot} ref={chainRootRef}>
              <button
                type="button"
                className={styles.networkTrigger}
                aria-haspopup="listbox"
                aria-expanded={menuOpen}
                aria-controls={listboxId}
                onClick={() => setMenuOpen((open) => !open)}
                onKeyDown={handleChainTriggerKeyDown}
              >
                <span className={styles.networkIconSlot} aria-hidden>
                  <SelectedNetworkIcon size={NETWORK_ICON_SIZE} variant="background" />
                </span>
                <span className={styles.networkCopy}>
                  <span className={styles.networkLabel}>Network</span>
                  <span className={styles.networkName}>{selectedChain.label}</span>
                </span>
                <ChevronDownIcon className={styles.chevron} aria-hidden />
              </button>

              {menuOpen ? (
                <ul
                  ref={chainListboxRef}
                  id={listboxId}
                  className={styles.networkMenu}
                  role="listbox"
                  tabIndex={-1}
                  aria-label="Network"
                  aria-activedescendant={chainActiveDescendantId}
                  onKeyDown={handleChainListboxKeyDown}
                >
                  {SEND_CHAIN_OPTIONS.map((option, index) => {
                    const OptionIcon = option.Icon
                    return (
                      <li key={option.id} role="presentation">
                        <button
                          type="button"
                          id={getChainOptionId(index)}
                          role="option"
                          aria-selected={option.id === chain}
                          className={[
                            styles.networkOption,
                            index === chainHighlightIndex && styles.networkOptionHighlighted,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => selectChain(option.id)}
                        >
                          <span className={styles.networkIconSlot} aria-hidden>
                            <OptionIcon size={NETWORK_ICON_SIZE} variant="background" />
                          </span>
                          <span>{option.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          ) : null}
          </div>

          {privacyBadge}
        </div>

        {actionRow}

        {showRecentList ? (
          <div className={`${styles.recentSection} ${styles.enterRecent}`}>
            <span className={styles.recentLabel}>Recent address</span>
            <ul className={styles.recentList}>
              {RECENT_SEND_ADDRESSES.map((item) => (
                <li key={item.address}>
                  <button
                    type="button"
                    className={styles.recentItem}
                    onClick={() => handleSelectRecent(item.address)}
                  >
                    <span className={styles.recentIconBadge} aria-hidden>
                      <ArrowRightIcon className={styles.recentIcon} strokeWidth={1.5} />
                    </span>
                    <span className={styles.recentAddress}>{truncateAddress(item.address)}</span>
                    <span className={styles.recentTime}>{item.sentAgo}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
