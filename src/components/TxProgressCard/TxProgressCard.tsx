import { useMemo, type CSSProperties } from 'react'
import type { TxProgressCardCopy } from '@/constants/txProcessingCopy'
import styles from './TxProgressCard.module.css'

const TICK_COUNT = 60

export interface TxProgressCardProps {
  copy: TxProgressCardCopy
  className?: string
}

function ProgressTitle({ copy }: { copy: TxProgressCardCopy }) {
  if (!copy.titleBreakAfter) {
    return <p className={styles.title}>{copy.title}</p>
  }

  const breakIndex = copy.title.indexOf(copy.titleBreakAfter)
  if (breakIndex === -1) {
    return <p className={styles.title}>{copy.title}</p>
  }

  const splitAt = breakIndex + copy.titleBreakAfter.length
  const firstLine = copy.title.slice(0, splitAt).trimEnd()
  const secondLine = copy.title.slice(splitAt).trim()

  return (
    <p className={styles.title}>
      {firstLine}
      <br />
      {secondLine}
    </p>
  )
}

export function TxProgressCard({ copy, className }: TxProgressCardProps) {
  const ticks = useMemo(() => Array.from({ length: TICK_COUNT }, (_, index) => index), [])

  const cls = [styles.card, className].filter(Boolean).join(' ')

  return (
    <section className={cls} aria-label={copy.tag}>
      <div className={styles.tickRing} aria-hidden>
        {ticks.map((index) => (
          <span key={index} className={styles.tick} style={{ '--i': index } as CSSProperties} />
        ))}
      </div>

      <div className={styles.content}>
        <p className={styles.tag}>{copy.tag}</p>

        <div className={styles.titleBlock}>
          <ProgressTitle copy={copy} />
        </div>

        <p className={styles.subtitle}>{copy.subtitle}</p>
      </div>
    </section>
  )
}
