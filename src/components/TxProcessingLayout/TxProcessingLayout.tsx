import { modalStepBodyEnter } from '@/components/ModalShell'
import {
  TransactionProgressDisclosure,
  type TransactionProgressVariant,
} from '@/components/TransactionProgressDisclosure'
import { TxProgressCard } from '@/components/TxProgressCard'
import { resolveStageLabel, type TxProgressCardCopy, type TxProgressStage } from '@/constants/txProcessingCopy'
import a11y from '@/styles/formA11y.module.css'
import styles from './TxProcessingLayout.module.css'

export interface TxProcessingLayoutProps {
  cardCopy: TxProgressCardCopy
  stages: ReadonlyArray<TxProgressStage>
  activeStageIndex?: number
  completed?: boolean
  progressVariant?: TransactionProgressVariant
  className?: string
}

export function TxProcessingLayout({
  cardCopy,
  stages,
  activeStageIndex = 0,
  completed = false,
  progressVariant = 'timeline',
  className,
}: TxProcessingLayoutProps) {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  const activeStage = stages[activeStageIndex]
  const statusAnnouncement = activeStage
    ? completed && activeStageIndex === stages.length - 1
      ? resolveStageLabel(activeStage, activeStageIndex, stages.length, true)
      : `${resolveStageLabel(activeStage, activeStageIndex, stages.length, completed)}. ${activeStage.subtitle}`
    : ''

  return (
    <div className={cls}>
      <p className={a11y.srOnly} aria-live="polite" aria-atomic="true">
        {statusAnnouncement}
      </p>
      <div className={`${modalStepBodyEnter} ${styles.body}`}>
        <TxProgressCard copy={cardCopy} />

        <div className={styles.belowCardStack}>
          <TransactionProgressDisclosure
            variant={progressVariant}
            stages={stages}
            activeStageIndex={activeStageIndex}
            completed={completed}
          />
        </div>
      </div>
    </div>
  )
}
