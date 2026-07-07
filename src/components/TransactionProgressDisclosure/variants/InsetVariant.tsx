import { ChevronDown } from 'lucide-react'
import type { TransactionProgressVariantProps } from '../transactionProgressUtils'
import { rowKindFor } from '../transactionProgressUtils'
import styles from './InsetVariant.module.css'

export function InsetVariant({
  stages,
  activeStageIndex = 0,
  className,
}: TransactionProgressVariantProps) {
  const activeStage = stages[activeStageIndex] ?? stages[0]
  const totalStages = stages.length
  const cls = [styles.root, className].filter(Boolean).join(' ')

  return (
    <details className={cls}>
      <summary className={styles.summary}>
        <div className={styles.collapsedCard}>
          <span className={styles.counter}>
            {activeStageIndex + 1} of {totalStages}
          </span>
          <span className={styles.stepTitle}>{activeStage.label}</span>
          <span className={styles.stepSubtitle}>{activeStage.subtitle}</span>
        </div>

        <span className={styles.summaryOpenLabel}>Transaction progress</span>
        <ChevronDown className={styles.chevron} size={16} aria-hidden />
      </summary>

      <ol className={styles.expandedList}>
        {stages.map((stage, index) => {
          const kind = rowKindFor(index, activeStageIndex)
          return (
            <li
              key={stage.id}
              className={[styles.expandedRow, styles[kind]].filter(Boolean).join(' ')}
              aria-current={kind === 'currentActive' ? 'step' : undefined}
            >
              <span className={styles.counterPill}>
                {index + 1} of {totalStages}
              </span>
              <span className={styles.stepTitle}>{stage.label}</span>
              <span className={styles.stepSubtitle}>{stage.subtitle}</span>
            </li>
          )
        })}
      </ol>
    </details>
  )
}
