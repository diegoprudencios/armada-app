import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { ArrowRightIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { Button } from '@/components/Button'
import { modalStepBodyEnter } from '@/components/ModalShell'
import { useEnvironment } from '@/hooks/useEnvironment'
import { readRecipientFromClipboard } from '@/utils/clipboardAddress'
import { truncateAddress } from '@/utils/format'
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
  const [environment] = useEnvironment()
  const isMock = environment === 'mock'

  const trimmed = recipient.trim()
  const hasInput = trimmed.length > 0
  const hasAddress = isValidRecipientAddress(trimmed)
  const showPasteButton = !hasInput && (isMock || clipboardHasAddress)
  const isPrivate = hasAddress && isArmadaAddress(trimmed)
  const isPublic = hasAddress && isPublicAddress(trimmed)
  const selectedChain = SEND_CHAIN_OPTIONS.find((option) => option.id === chain) ?? SEND_CHAIN_OPTIONS[0]
  const SelectedNetworkIcon = selectedChain.Icon

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
      return
    }

    const address = await readRecipientFromClipboard()
    if (address) {
      onRecipientChange(address)
    }
  }

  function selectChain(next: SendChainId) {
    onChainChange(next)
    setMenuOpen(false)
  }

  return (
    <div className={styles.column}>
      <div className={modalStepBodyEnter}>
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
              value={recipient}
              onChange={(event) => onRecipientChange(event.target.value)}
              placeholder="Enter address"
              spellCheck={false}
              autoComplete="off"
              aria-label="Recipient address"
            />
            {showPasteButton ? (
              <button type="button" className={styles.pasteButton} onClick={() => void handlePaste()}>
                Paste
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
              >
                <span className={styles.networkIconSlot} aria-hidden>
                  <SelectedNetworkIcon size={NETWORK_ICON_SIZE} variant="background" />
                </span>
                <span className={styles.networkName}>{selectedChain.label}</span>
                <ChevronDownIcon className={styles.chevron} aria-hidden />
              </button>

              {menuOpen ? (
                <ul id={listboxId} className={styles.networkMenu} role="listbox" aria-label="Network">
                  {SEND_CHAIN_OPTIONS.map((option) => {
                    const OptionIcon = option.Icon
                    return (
                      <li key={option.id} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={option.id === chain}
                          className={styles.networkOption}
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

        {hasAddress ? (
          <div className={`${styles.actionRow} ${styles.actionRowReveal}`}>
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

        {showRecentAddresses ? (
          <div className={styles.recentSection}>
            <span className={styles.recentLabel}>Recent address</span>
            <ul className={styles.recentList}>
              {RECENT_SEND_ADDRESSES.map((item) => (
                <li key={item.address}>
                  <button
                    type="button"
                    className={styles.recentItem}
                    onClick={() => onRecipientChange(item.address)}
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
