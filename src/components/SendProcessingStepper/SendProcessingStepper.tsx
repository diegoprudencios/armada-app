import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Button } from '@/components/Button'
import { modalActionRowEnter, modalStepBodyEnter } from '@/components/ModalShell'
import { StatusChip } from '@/components/StatusChip'
import { TechnicalDetailsDisclosure } from '@/components/TechnicalDetailsDisclosure'
import {
  sendProcessingFinalStageLabel,
  sendProcessingKind,
  type SendFlowVariant,
} from '@/pages/sendFlowConstants'
import styles from './SendProcessingStepper.module.css'

const DEMO_RECORD_ID = '01JKSEND9MVT3SZ6XQ0ZI9XVFAP'

function processingStages(variant: SendFlowVariant) {
  return [
    { id: 'build-proof', label: 'Preparing transaction' },
    { id: 'submit-relayer', label: 'Submitting transaction' },
    { id: 'sent', label: sendProcessingFinalStageLabel(variant) },
  ] as const
}

type RowKind = 'done' | 'currentActive' | 'pending'

function rowKindFor(index: number, activeIndex: number): RowKind {
  if (index < activeIndex) return 'done'
  if (index === activeIndex) return 'currentActive'
  return 'pending'
}

function RowIcon({ kind }: { kind: RowKind }) {
  switch (kind) {
    case 'done':
      return <CheckCircle2 className={styles.iconDone} size={20} aria-hidden />
    case 'currentActive':
      return <Loader2 className={styles.iconActive} size={20} aria-hidden />
    case 'pending':
      return <Circle className={styles.iconPending} size={20} aria-hidden />
  }
}

export interface SendProcessingStepperProps {
  activeStageIndex?: number
  variant?: SendFlowVariant
  onCancel?: () => void
  className?: string
}

export function SendProcessingStepper({
  activeStageIndex = 0,
  variant = 'send',
  onCancel,
  className,
}: SendProcessingStepperProps) {
  const stages = processingStages(variant)
  const activeStage = stages[activeStageIndex] ?? stages[0]
  const cls = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <div className={modalStepBodyEnter}>
        <section className={styles.statusCard} aria-label="Transaction status">
          <header className={styles.header}>
            <StatusChip label="Pending" variant="warning" />
            <span className={styles.eta}>Usually takes ~8 sec</span>
          </header>

          <ol className={styles.stages}>
            {stages.map((stage, index) => {
              const kind = rowKindFor(index, activeStageIndex)
              const isCurrent = kind === 'currentActive'
              return (
                <li
                  key={stage.id}
                  className={[styles.row, styles[kind]].filter(Boolean).join(' ')}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className={styles.iconCell}>
                    <RowIcon kind={kind} />
                  </span>
                  <span className={styles.label}>{stage.label}</span>
                </li>
              )
            })}
          </ol>
        </section>

        <section className={styles.detailsCard} aria-label="Technical details">
          <TechnicalDetailsDisclosure className={styles.detailsDisclosure}>
            <dl className={styles.facts}>
              <div>
                <dt>Record id</dt>
                <dd>{DEMO_RECORD_ID}</dd>
              </div>
              <div>
                <dt>Kind</dt>
                <dd>{sendProcessingKind(variant)}</dd>
              </div>
              <div>
                <dt>Stage</dt>
                <dd>{activeStage.id}</dd>
              </div>
              <div>
                <dt>Execution state</dt>
                <dd>pending</dd>
              </div>
            </dl>
          </TechnicalDetailsDisclosure>
        </section>
      </div>

      {onCancel ? (
        <div className={`${styles.actionFooter} ${modalActionRowEnter}`}>
          <Button variant="secondary" size="lg" label="Cancel" showIcon={false} onClick={onCancel} />
        </div>
      ) : null}
    </div>
  )
}
