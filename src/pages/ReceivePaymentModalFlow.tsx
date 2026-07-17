import { useCallback, useEffect, useRef, useState } from 'react'
import { FlowModalOverlay } from '@/components/FlowModalOverlay'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import { MODAL_EXIT_TIMING_VARS, MODAL_EXIT_TOTAL_MS } from '@/components/ModalShell/modalExitMotion'
import type { SendChainId } from './sendFlowConstants'
import { ReceivePaymentConfirmedScreen } from './ReceivePaymentConfirmedScreen'

export interface ReceivePaymentModalFlowProps {
  amount: string
  sender: string
  chain: SendChainId
  txHash: string
  confirmedAt: number
  armadaAddress?: string
  onClose: () => void
}

export function ReceivePaymentModalFlow({
  amount,
  sender,
  chain,
  txHash,
  confirmedAt,
  armadaAddress,
  onClose,
}: ReceivePaymentModalFlowProps) {
  const [exiting, setExiting] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
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

  function handleConfirmedGoToDashboard() {
    onClose()
    requestClose()
  }

  return (
    <FlowModalOverlay
      label="Payment received"
      exiting={exiting}
      onClose={requestClose}
      initialFocusRef={closeButtonRef}
      style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}
    >
      <ModalShell
        steps={['Received']}
        currentStep={1}
        status="confirmed"
        hideSteps
        exiting={exiting}
        onClose={requestClose}
        closeButtonRef={closeButtonRef}
      >
        <div className={modalStepShell}>
          <ReceivePaymentConfirmedScreen
            amount={amount}
            sender={sender}
            chain={chain}
            txHash={txHash}
            confirmedAt={confirmedAt}
            armadaAddress={armadaAddress}
            onViewExplorer={() => {
              if (txHash) {
                window.open(`https://etherscan.io/tx/${txHash}`, '_blank', 'noopener,noreferrer')
              }
            }}
            onGoToDashboard={handleConfirmedGoToDashboard}
          />
        </div>
      </ModalShell>
    </FlowModalOverlay>
  )
}
