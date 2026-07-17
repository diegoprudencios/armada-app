import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckIcon, ClipboardDocumentIcon, LinkIcon } from '@heroicons/react/24/outline'
import type { AmountInputEntryMode } from '@/components/AmountInputScreen'
import { BottomSheet } from '@/components/BottomSheet'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { revokePaymentLink } from '@/utils/payViaLink'
import { RequestAmountScreen } from './RequestAmountScreen'
import chooserStyles from './RequestChooserSheet.module.css'
import { RequestDetailsScreen } from './RequestDetailsScreen'
import { RequestLinkScreen } from './RequestLinkScreen'
import { RequestPaidConfirmedScreen } from './RequestPaidConfirmedScreen'
import { RequestReceiveScreen } from './RequestReceiveScreen'
import {
  buildPayViaLinkUrl,
  createPaymentRequestId,
  requestLinkExpiryMs,
  REQUEST_PROGRESS_STEPS,
  type RequestLinkExpiryId,
  type RequestModalStep,
} from './requestFlowConstants'

const REQUEST_STEP_NUMBER: Record<RequestModalStep, number> = {
  choose: 1,
  receive: 1,
  amount: 1,
  details: 1,
  link: 2,
  confirmed: 2,
}

const REQUEST_SIMPLE_HEADER_TITLE: Partial<Record<RequestModalStep, string>> = {
  amount: 'Request',
  details: 'Request',
  link: '',
  confirmed: '',
}

const COPY_FEEDBACK_MS = 900

function requestAmountEntryModeFromSearch(search = window.location.search): AmountInputEntryMode {
  const value = new URLSearchParams(search).get('keypad')
  return value === '1' || value === 'true' ? 'keypad' : 'input'
}

export type RequestLinkPayload = {
  paymentLink: string
  requestId: string
  expiresAt: number
}

export interface RequestModalFlowProps {
  step: RequestModalStep
  privateAddress: string
  amount: string
  note: string
  expiryId: RequestLinkExpiryId
  paymentLink: string
  requestId: string
  expiresAt: number
  linkRevoked: boolean
  confirmedAt?: number | null
  receiptTxHash?: string
  onClose: () => void
  onAmountChange: (amount: string) => void
  onNoteChange: (note: string) => void
  onExpiryChange: (expiryId: RequestLinkExpiryId) => void
  onChooseRequestViaLink: () => void
  onAmountContinue: (amount: string) => void
  onAmountBack: () => void
  onDetailsBack: () => void
  onCreateLink: (payload: RequestLinkPayload) => void
  onLinkRevoked: () => void
  onDone: () => void
}

export function RequestModalFlow({
  step,
  privateAddress,
  amount,
  note,
  expiryId,
  paymentLink,
  requestId,
  expiresAt,
  linkRevoked,
  confirmedAt,
  receiptTxHash,
  onClose,
  onAmountChange,
  onNoteChange,
  onExpiryChange,
  onChooseRequestViaLink,
  onAmountContinue,
  onAmountBack,
  onDetailsBack,
  onCreateLink,
  onLinkRevoked,
  onDone,
}: RequestModalFlowProps) {
  const [exiting, setExiting] = useState(false)
  const [chooserOpen, setChooserOpen] = useState(step === 'choose')
  const [addressCopied, setAddressCopied] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const chooserIntentRef = useRef<'close' | 'requestViaLink' | null>(null)
  const copyCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const amountEntryMode = useMemo(() => requestAmountEntryModeFromSearch(), [])
  const isMobile = useMobileLayout()
  const useKeypadMobileChrome = amountEntryMode === 'keypad' && isMobile
  const isConfirmed = step === 'confirmed'
  const showModal = !(useKeypadMobileChrome && step === 'choose')

  const requestClose = useCallback(() => {
    setExiting((current) => (current ? current : true))
  }, [])

  useEffect(() => {
    if (!exiting) return
    const timer = window.setTimeout(() => onCloseRef.current(), MODAL_EXIT_TOTAL_MS)
    return () => window.clearTimeout(timer)
  }, [exiting])

  useEffect(() => {
    if (step === 'choose') {
      setChooserOpen(true)
      setAddressCopied(false)
      chooserIntentRef.current = null
      return
    }
    if (chooserIntentRef.current !== 'requestViaLink') {
      setChooserOpen(false)
    }
  }, [step])

  useEffect(
    () => () => {
      if (copyCloseTimerRef.current) clearTimeout(copyCloseTimerRef.current)
    },
    [],
  )

  function handleCreateLink() {
    const nextRequestId = createPaymentRequestId()
    const nextExpiresAt = Date.now() + requestLinkExpiryMs(expiryId)
    const trimmedNote = note.trim()
    const nextPaymentLink = buildPayViaLinkUrl({
      recipientAddress: privateAddress,
      requestId: nextRequestId,
      expiresAt: nextExpiresAt,
      amount,
      note: trimmedNote || undefined,
    })

    onCreateLink({
      paymentLink: nextPaymentLink,
      requestId: nextRequestId,
      expiresAt: nextExpiresAt,
    })
  }

  function handleRevokeLink() {
    if (requestId) {
      revokePaymentLink(requestId)
    }
    onLinkRevoked()
  }

  function handleDone() {
    onDone()
    requestClose()
  }

  function handleConfirmedGoToDashboard() {
    onDone()
    requestClose()
  }

  function handleChooserClose() {
    if (addressCopied) return
    chooserIntentRef.current = 'close'
    setChooserOpen(false)
  }

  function handleChooserExited() {
    const intent = chooserIntentRef.current
    chooserIntentRef.current = null
    if (intent === 'requestViaLink') {
      onChooseRequestViaLink()
      return
    }
    if (intent === 'close' || step === 'choose') {
      onClose()
    }
  }

  function handleRequestViaLink() {
    chooserIntentRef.current = 'requestViaLink'
    setChooserOpen(false)
  }

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(privateAddress)
      setAddressCopied(true)
      if (copyCloseTimerRef.current) clearTimeout(copyCloseTimerRef.current)
      copyCloseTimerRef.current = setTimeout(() => {
        chooserIntentRef.current = 'close'
        setChooserOpen(false)
      }, COPY_FEEDBACK_MS)
    } catch {
      // clipboard unavailable
    }
  }

  const amountScreen = (
    <RequestAmountScreen
      amount={amount}
      entryMode={amountEntryMode}
      amountInputRef={amountEntryMode === 'input' ? amountInputRef : undefined}
      onAmountChange={onAmountChange}
      onBack={onAmountBack}
      onContinue={onAmountContinue}
    />
  )

  function renderStep() {
    if (step === 'confirmed') {
      return (
        <RequestPaidConfirmedScreen
          amount={amount}
          note={note.trim() || undefined}
          txHash={receiptTxHash ?? ''}
          confirmedAt={confirmedAt ?? Date.now()}
          onViewExplorer={() => {
            if (receiptTxHash) {
              window.open(`https://etherscan.io/tx/${receiptTxHash}`, '_blank', 'noopener,noreferrer')
            }
          }}
          onGoToDashboard={handleConfirmedGoToDashboard}
        />
      )
    }

    if (step === 'link') {
      return (
        <RequestLinkScreen
          paymentLink={paymentLink}
          amount={amount}
          note={note.trim() || undefined}
          expiresAt={expiresAt}
          revoked={linkRevoked}
          onRevoke={handleRevokeLink}
          onDone={handleDone}
        />
      )
    }

    if (useKeypadMobileChrome) {
      if (step === 'amount') {
        return amountScreen
      }
      if (step === 'details') {
        return (
          <RequestDetailsScreen
            amount={amount}
            note={note}
            expiryId={expiryId}
            keypadMobileLayout
            onNoteChange={onNoteChange}
            onExpiryChange={onExpiryChange}
            onBack={onDetailsBack}
            onCreateLink={handleCreateLink}
          />
        )
      }
    }

    return (
      <RequestReceiveScreen
        privateAddress={privateAddress}
        amount={amount}
        note={note}
        expiryId={expiryId}
        amountInputRef={amountInputRef}
        onAmountChange={onAmountChange}
        onNoteChange={onNoteChange}
        onExpiryChange={onExpiryChange}
        onCreateLink={handleCreateLink}
      />
    )
  }

  const keypadBack =
    step === 'details' ? onDetailsBack : step === 'amount' ? onAmountBack : undefined

  const chooserSheet = useKeypadMobileChrome ? (
    <BottomSheet
      open={chooserOpen}
      onClose={handleChooserClose}
      onExited={handleChooserExited}
      title="Request"
      ariaLabel="Request"
    >
      <div className={chooserStyles.list} role="menu">
        <button
          type="button"
          className={chooserStyles.item}
          role="menuitem"
          onClick={handleRequestViaLink}
        >
          <span className={chooserStyles.itemLead}>
            <span className={chooserStyles.iconBadge}>
              <LinkIcon className={chooserStyles.icon} strokeWidth={1.5} />
            </span>
            <span className={chooserStyles.label}>Request via link</span>
          </span>
        </button>
        <button
          type="button"
          className={chooserStyles.item}
          role="menuitem"
          disabled={addressCopied}
          onClick={() => void handleCopyAddress()}
        >
          <span className={chooserStyles.itemLead}>
            <span className={chooserStyles.iconBadge}>
              {addressCopied ? (
                <CheckIcon className={chooserStyles.icon} strokeWidth={1.5} aria-hidden />
              ) : (
                <ClipboardDocumentIcon className={chooserStyles.icon} strokeWidth={1.5} />
              )}
            </span>
            <span className={chooserStyles.label}>
              {addressCopied ? 'Copied' : 'Copy address'}
            </span>
          </span>
        </button>
      </div>
    </BottomSheet>
  ) : null

  if (!showModal) {
    return chooserSheet
  }

  return (
    <>
      <FlowModalOverlay
        label="Request"
        exiting={exiting}
        onClose={requestClose}
        initialFocusRef={
          (step === 'receive' || (step === 'amount' && amountEntryMode === 'input'))
            ? amountInputRef
            : closeButtonRef
        }
        style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
      >
        <ModalShell
          steps={[...REQUEST_PROGRESS_STEPS]}
          currentStep={REQUEST_STEP_NUMBER[step]}
          status={isConfirmed ? 'confirmed' : 'default'}
          hideSteps={isConfirmed}
          flowLabel="Request"
          chrome={useKeypadMobileChrome ? 'simple' : 'default'}
          headerTitle={
            useKeypadMobileChrome ? REQUEST_SIMPLE_HEADER_TITLE[step] ?? 'Request' : undefined
          }
          onBack={useKeypadMobileChrome ? keypadBack : undefined}
          exiting={exiting}
          onClose={requestClose}
          closeButtonRef={closeButtonRef}
        >
          <div key={step} className={modalStepShell}>
            {renderStep()}
          </div>
        </ModalShell>
      </FlowModalOverlay>
      {chooserSheet}
    </>
  )
}
