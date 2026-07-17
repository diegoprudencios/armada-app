import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { ArrowRightIcon, GlobeAltIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { Button } from '@/components/Button'
import { modalStepBodyEnter } from '@/components/ModalShell'
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
  sendRecipientTitleLead,
  SEND_RECIPIENT_TITLE_TAIL,
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
  onContinue: () => void
}

export function SendRecipientScreen({
  recipient,
  chain,
  variant = 'send',
  showRecentAddresses = true,
  onRecipientChange,
  onChainChange,
  onContinue,
}: SendRecipientScreenProps) {
  const inputId = useId()
  const listboxId = useId()
  const chainRootRef = useRef<HTMLDivElement>(null)
  const pasteToggleRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [clipboardHasAddress, setClipboardHasAddress] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [fittedAddress, setFittedAddress] = useState(recipient)
  const [environment] = useEnvironment()
  const isMobile = useMobileLayout()
  const isMock = environment === 'mock'

  const trimmed = recipient.trim()
  const hasInput = trimmed.length > 0
  const hasAddress = isValidRecipientAddress(trimmed)
  const showPasteButton = !hasInput && (isMock || clipboardHasAddress)
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
  }, [trimmed, recipient, showPasteButton, hasInput, inputFocused])

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
    if (isMock || hasInput) {
      setClipboardHasAddress(false)
      return
    }

    let cancelled = false

    async function probeClipboard() {
      const address = await readRecipientFromClipboard()
      if (!cancelled) {
        setClipboardHasAddress(address !== null)
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

  useEffect(() => {
    if (!menuOpen) return
    function handlePointerDown(event: MouseEvent) {
      if (!chainRootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [menuOpen])

  async function handlePaste() {
    if (isMock) {
      const next = pasteToggleRef.current ? DEMO_0X_RECIPIENT : DEMO_ZK_RECIPIENT
      pasteToggleRef.current = !pasteToggleRef.current
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

  return (
    <div className={styles.column}>
      <div className={`${styles.body} ${modalStepBodyEnter}`}>
        <h1 className={styles.title}>
          {sendRecipientTitleLead(variant)}
          <br />
          {SEND_RECIPIENT_TITLE_TAIL}
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
            {showPasteButton ? (
              <button type="button" className={styles.pasteButton} onClick={() => void handlePaste()}>
                Paste
              </button>
            ) : null}
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
                <span className={styles.networkName}>{selectedChain.label}</span>
                <ChevronDownIcon className={styles.chevron} aria-hidden />
              </button>

              {menuOpen ? (
                <ul
                  id={listboxId}
                  className={styles.networkMenu}
                  role="listbox"
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

        {showRecentList ? (
          <div className={styles.recentSection}>
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

      {hasAddress ? (
        <div className={`${styles.footer} ${styles.actionRowReveal}`}>
          <div className={styles.privacyBadge}>
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
                <ArmadaLogo variant="mark" markTone="white" className={styles.brandMark} />
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
          <Button
            variant="primary"
            size="lg"
            label="Continue"
            showIcon={false}
            className={styles.continueButton}
            onClick={onContinue}
          />
        </div>
      ) : null}
    </div>
  )
}
