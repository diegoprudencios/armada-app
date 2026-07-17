import { useCallback, useEffect, useRef, useState } from 'react'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { revokePaymentLink } from '@/utils/payViaLink'
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
  receive: 1,
  link: 2,
  confirmed: 2,
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
  onCreateLink,
  onLinkRevoked,
  onDone,
}: RequestModalFlowProps) {
  const [exiting, setExiting] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const isConfirmed = step === 'confirmed'

  const requestClose = useCallback(() => {
    setExiting((current) => (current ? current : true))
  }, [])

  useEffect(() => {
    if (!exiting) return
    const timer = window.setTimeout(() => onCloseRef.current(), MODAL_EXIT_TOTAL_MS)
    return () => window.clearTimeout(timer)
  }, [exiting])

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

    return (
      <RequestReceiveScreen
        privateAddress={privateAddress}
        amount={amount}
        note={note}
        expiryId={expiryId}
        onAmountChange={onAmountChange}
        onNoteChange={onNoteChange}
        onExpiryChange={onExpiryChange}
        onCreateLink={handleCreateLink}
      />
    )
  }

  return (
    <FlowModalOverlay
      label="Request"
      exiting={exiting}
      onClose={requestClose}
      initialFocusRef={closeButtonRef}
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={[...REQUEST_PROGRESS_STEPS]}
        currentStep={REQUEST_STEP_NUMBER[step]}
        status={isConfirmed ? 'confirmed' : 'default'}
        hideSteps={isConfirmed}
        flowLabel="Request"
        exiting={exiting}
        onClose={requestClose}
        closeButtonRef={closeButtonRef}
      >
        <div key={step} className={modalStepShell}>
          {renderStep()}
        </div>
      </ModalShell>
    </FlowModalOverlay>
  )
}
