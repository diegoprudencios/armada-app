import { useRef, type ReactNode, type Ref } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { Steps } from '@/components/Steps'
import { MODAL_EXIT_TIMING_VARS } from './modalExitMotion'
import styles from './ModalShell.module.css'

export const modalActionRowEnter = styles.actionRowEnter
export const modalStepShell = styles.stepShell
export const modalStepBodyEnter = styles.stepBodyEnter

export interface ModalShellProps {
  steps: string[]
  currentStep: number
  status?: 'default' | 'confirmed'
  flowLabel?: string
  hideStepCount?: boolean
  hideSteps?: boolean
  exiting?: boolean
  onClose: () => void
  closeButtonRef?: Ref<HTMLButtonElement>
  children: ReactNode
}

export function ModalShell({
  steps,
  currentStep,
  status = 'default',
  flowLabel = 'Deposit',
  hideStepCount = false,
  hideSteps = false,
  exiting = false,
  onClose,
  closeButtonRef,
  children,
}: ModalShellProps) {
  const fallbackCloseRef = useRef<HTMLButtonElement>(null)
  const resolvedCloseRef = closeButtonRef ?? fallbackCloseRef
  const headerClassName = [styles.header, hideSteps && styles.headerNoSteps, exiting && styles.headerExit]
    .filter(Boolean)
    .join(' ')

  const contentClassName = [styles.content, exiting && styles.contentExit].filter(Boolean).join(' ')

  return (
    <div className={styles.shell} style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}>
      <header className={headerClassName}>
        <div className={styles.logoSlot}>
          <ArmadaLogo variant="mark" markTone="white" className={styles.logo} />
        </div>
        {hideSteps ? null : (
          <div className={styles.stepsWrap}>
            <Steps
              steps={steps}
              currentStep={currentStep}
              status={status}
              flowLabel={status === 'confirmed' ? undefined : flowLabel}
              hideStepCount={hideStepCount}
            />
          </div>
        )}
        <button
          ref={resolvedCloseRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className={styles.closeIcon} strokeWidth={1.5} aria-hidden />
        </button>
      </header>
      <div className={contentClassName}>{children}</div>
    </div>
  )
}
