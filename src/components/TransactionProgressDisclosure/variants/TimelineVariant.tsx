import { ChevronDown } from 'lucide-react'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { RowKind, TransactionProgressVariantProps } from '../transactionProgressUtils'
import { rowKindFor, stageLabelFor } from '../transactionProgressUtils'
import styles from './TimelineVariant.module.css'

interface TimelineStepProps {
  kind: RowKind
  counter: string
  label: string
  subtitle: string
}

interface SlideMetrics {
  rowHeight: number
  rowStride: number
  totalHeight: number
}

const DEFAULT_ROW_HEIGHT = 52
const DEFAULT_ROW_STRIDE = 68
const DEFAULT_TOTAL_HEIGHT = 220

function ProgressBar({ kind }: { kind: RowKind }) {
  return (
    <div
      className={[styles.barTrack, styles[`barTrack_${kind}`]].filter(Boolean).join(' ')}
      aria-hidden
    >
      {kind === 'currentActive' ? <span className={styles.barIndicator} /> : null}
    </div>
  )
}

function TimelineStep({ kind, counter, label, subtitle }: TimelineStepProps) {
  return (
    <div className={[styles.stepRow, styles[kind]].filter(Boolean).join(' ')}>
      <ProgressBar kind={kind} />

      <div className={styles.stepCopy}>
        <span className={styles.counter}>{counter}</span>
        <span className={styles.stepTitle}>{label}</span>
        <span className={styles.stepSubtitle}>{subtitle}</span>
      </div>
    </div>
  )
}

function measureSlideMetrics(
  list: HTMLOListElement,
  rows: Array<HTMLLIElement | null>,
): SlideMetrics {
  const firstRow = rows[0]
  if (!firstRow) {
    return {
      rowHeight: DEFAULT_ROW_HEIGHT,
      rowStride: DEFAULT_ROW_STRIDE,
      totalHeight: DEFAULT_TOTAL_HEIGHT,
    }
  }

  const gap = Number.parseFloat(getComputedStyle(list).rowGap || getComputedStyle(list).gap) || 0
  const rowHeight = firstRow.getBoundingClientRect().height
  const rowStride = rowHeight + gap

  return {
    rowHeight,
    rowStride,
    totalHeight: list.scrollHeight,
  }
}

export function TimelineVariant({
  stages,
  activeStageIndex = 0,
  completed = false,
  className,
}: TransactionProgressVariantProps) {
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [metrics, setMetrics] = useState<SlideMetrics>({
    rowHeight: DEFAULT_ROW_HEIGHT,
    rowStride: DEFAULT_ROW_STRIDE,
    totalHeight: DEFAULT_TOTAL_HEIGHT,
  })

  const listRef = useRef<HTMLOListElement>(null)
  const rowRefs = useRef<Array<HTMLLIElement | null>>([])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const updateMetrics = () => {
      setMetrics(measureSlideMetrics(list, rowRefs.current))
    }

    updateMetrics()

    const observer = new ResizeObserver(updateMetrics)
    observer.observe(list)
    rowRefs.current.forEach((row) => {
      if (row) observer.observe(row)
    })

    return () => observer.disconnect()
  }, [stages, activeStageIndex, completed, isOpen])

  const collapsedOffset = activeStageIndex * metrics.rowStride
  const viewportHeight = isOpen ? metrics.totalHeight : metrics.rowHeight
  const trackOffset = isOpen ? 0 : collapsedOffset

  const cls = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <button
        type="button"
        className={styles.toggleButton}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <ChevronDown className={styles.chevron} size={14} aria-hidden />
      </button>

      <div
        id={panelId}
        className={styles.viewport}
        style={{ height: viewportHeight }}
        aria-label="Transaction progress"
      >
        <div className={styles.track} style={{ transform: `translateY(-${trackOffset}px)` }}>
          <ol ref={listRef} className={styles.stepList}>
            {stages.map((stage, index) => {
              const kind = rowKindFor(index, activeStageIndex, completed)
              return (
                <li
                  key={stage.id}
                  ref={(element) => {
                    rowRefs.current[index] = element
                  }}
                  className={styles.stepItem}
                  aria-current={kind === 'currentActive' || kind === 'completedFinal' ? 'step' : undefined}
                >
                  <TimelineStep
                    kind={kind}
                    counter={`${index + 1} of ${stages.length}`}
                    label={stageLabelFor(stage, index, stages, completed)}
                    subtitle={stage.subtitle}
                  />
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
