import { useCallback, useEffect, useRef, useState } from 'react'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import { revokePaymentLink } from '@/utils/payViaLink'
import { RequestLinkScreen } from './RequestLinkScreen'
import { RequestReceiveScreen } from './RequestReceiveScreen'
import {
  buildPayViaLinkUrl,
  createPaymentRequestId,
  createPaymentRoutingAddress,
  requestLinkExpiryMs,
  REQUEST_PROGRESS_STEPS,
  type RequestLinkExpiryId,
  type RequestModalStep,
} from './requestFlowConstants'
import styles from './RequestModalFlow.module.css'

const REQUEST_STEP_NUMBER: Record<RequestModalStep, number> = {
  receive: 1,
  link: 2,
}

export type RequestLinkPayload = {
  paymentLink: string
  routingAddress: string
  requestId: string
  expiresAt: number
}

export interface RequestModalFlowProps {
  step: RequestModalStep
  privateAddress: string
  amount: string
  anyAmount: boolean
  note: string
  expiryId: RequestLinkExpiryId
  paymentLink: string
  routingAddress: string
  requestId: string
  expiresAt: number
  linkRevoked: boolean
  onClose: () => void
  onAmountChange: (amount: string) => void
  onAnyAmountChange: (anyAmount: boolean) => void
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
  anyAmount,
  note,
  expiryId,
  paymentLink,
  routingAddress,
  requestId,
  expiresAt,
  linkRevoked,
  onClose,
  onAmountChange,
  onAnyAmountChange,
  onNoteChange,
  onExpiryChange,
  onCreateLink,
  onLinkRevoked,
  onDone,
}: RequestModalFlowProps) {
  const [exiting, setExiting] = useState(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

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
    const nextRoutingAddress = createPaymentRoutingAddress(nextRequestId, privateAddress)
    const nextExpiresAt = Date.now() + requestLinkExpiryMs(expiryId)
    const trimmedNote = note.trim()
    const nextPaymentLink = buildPayViaLinkUrl({
      routingAddress: nextRoutingAddress,
      requestId: nextRequestId,
      expiresAt: nextExpiresAt,
      amount: anyAmount ? undefined : amount,
      note: trimmedNote || undefined,
    })

    onCreateLink({
      paymentLink: nextPaymentLink,
      routingAddress: nextRoutingAddress,
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

  function renderStep() {
    if (step === 'link') {
      return (
        <RequestLinkScreen
          paymentLink={paymentLink}
          routingAddress={routingAddress}
          amount={anyAmount ? undefined : amount}
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
        anyAmount={anyAmount}
        note={note}
        expiryId={expiryId}
        onAmountChange={onAmountChange}
        onAnyAmountChange={onAnyAmountChange}
        onNoteChange={onNoteChange}
        onExpiryChange={onExpiryChange}
        onCreateLink={handleCreateLink}
      />
    )
  }

  const overlayClassName = [styles.overlay, exiting && styles.overlayExiting].filter(Boolean).join(' ')

  return (
    <div
      className={overlayClassName}
      role="presentation"
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={[...REQUEST_PROGRESS_STEPS]}
        currentStep={REQUEST_STEP_NUMBER[step]}
        flowLabel="Receive"
        exiting={exiting}
        onClose={requestClose}
      >
        <div key={step} className={modalStepShell}>
          {renderStep()}
        </div>
      </ModalShell>
    </div>
  )
}
