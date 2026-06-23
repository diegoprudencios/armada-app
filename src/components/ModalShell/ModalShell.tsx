import type { ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { Steps } from '@/components/Steps'
import { MODAL_EXIT_TIMING_VARS } from './modalExitMotion'
import styles from './ModalShell.module.css'

export const modalActionRowEnter = styles.actionRowEnter
export const modalStepShell = styles.stepShell
export const modalStepBodyEnter = styles.stepBodyEnter

export type ModalShellContentOffset = 'default' | 'confirmation'

export interface ModalShellProps {
  steps: string[]
  currentStep: number
  status?: 'default' | 'confirmed'
  flowLabel?: string
  contentOffset?: ModalShellContentOffset
  exiting?: boolean
  onClose: () => void
  children: ReactNode
}

export function ModalShell({
  steps,
  currentStep,
  status = 'default',
  flowLabel = 'Deposit',
  contentOffset = 'default',
  exiting = false,
  onClose,
  children,
}: ModalShellProps) {
  const headerClassName = [styles.header, exiting && styles.headerExit].filter(Boolean).join(' ')

  const contentClassName = [
    styles.content,
    contentOffset === 'confirmation' ? styles.contentConfirmation : styles.contentDefault,
    exiting && styles.contentExit,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.shell} style={exiting ? MODAL_EXIT_TIMING_VARS : undefined}>
      <header className={headerClassName}>
        <div className={styles.logoSlot}>
          <ArmadaLogo variant="mark" markTone="white" className={styles.logo} />
        </div>
        <div className={styles.stepsWrap}>
          <Steps
            steps={steps}
            currentStep={currentStep}
            status={status}
            flowLabel={status === 'confirmed' ? undefined : flowLabel}
          />
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <XMarkIcon className={styles.closeIcon} strokeWidth={1.5} aria-hidden />
        </button>
      </header>
      <div className={contentClassName}>{children}</div>
    </div>
  )
}
