import { CheckCircle2, ChevronDown, Circle, Loader2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { RowKind, TransactionProgressVariantProps } from '../transactionProgressUtils'
import { rowKindFor } from '../transactionProgressUtils'
import styles from './SegmentsVariant.module.css'

function SegmentBar({
  stages,
  activeStageIndex,
}: {
  stages: ReadonlyArray<{ id: string }>
  activeStageIndex: number
}) {
  return (
    <div
      className={styles.segmentBar}
      style={{ '--segment-count': stages.length } as CSSProperties}
      aria-hidden
    >
      {stages.map((stage, index) => {
        const kind = rowKindFor(index, activeStageIndex)
        return (
          <span
            key={stage.id}
            className={[
              styles.segment,
              kind === 'done' || kind === 'currentActive' ? styles.segmentFilled : styles.segmentEmpty,
              kind === 'currentActive' ? styles.segmentCurrent : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        )
      })}
    </div>
  )
}

function StatusIcon({ kind }: { kind: RowKind }) {
  switch (kind) {
    case 'done':
      return <CheckCircle2 className={styles.iconDone} size={18} aria-hidden />
    case 'currentActive':
      return <Loader2 className={styles.iconActive} size={18} aria-hidden />
    case 'pending':
      return <Circle className={styles.iconPending} size={18} aria-hidden />
  }
}

export function SegmentsVariant({
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
        <div className={styles.fixedHeader}>
          <span className={styles.headerTitle}>Transaction in progress</span>
          <div className={styles.headerMeta}>
            <span className={styles.counter}>
              {activeStageIndex + 1} of {totalStages}
            </span>
            <ChevronDown className={styles.chevron} size={16} aria-hidden />
          </div>
        </div>

        <SegmentBar stages={stages} activeStageIndex={activeStageIndex} />

        <div className={styles.collapsedStep}>
          <span className={styles.stepTitle}>{activeStage.label}</span>
          <span className={styles.stepSubtitle}>{activeStage.subtitle}</span>
        </div>
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
              <StatusIcon kind={kind} />
              <div className={styles.stepCopy}>
                <span className={styles.rowMeta}>
                  {index + 1} of {totalStages}
                </span>
                <span className={styles.stepTitle}>{stage.label}</span>
                <span className={styles.stepSubtitle}>{stage.subtitle}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </details>
  )
}
