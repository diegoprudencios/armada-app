import { modalStepBodyEnter } from '@/components/ModalShell'
import {
  TransactionProgressDisclosure,
  type TransactionProgressVariant,
} from '@/components/TransactionProgressDisclosure'
import { TxProgressCard } from '@/components/TxProgressCard'
import type { TxProgressCardCopy, TxProgressStage } from '@/constants/txProcessingCopy'
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

  return (
    <div className={cls}>
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
