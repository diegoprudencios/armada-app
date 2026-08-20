import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import styles from './ActivityTxHashSearch.module.css'

export interface ActivityTxHashSearchProps {
  value: string
  onChange: (value: string) => void
  surface?: 'frost' | 'tint' | 'raised'
}

export function ActivityTxHashSearch({ value, onChange, surface = 'raised' }: ActivityTxHashSearchProps) {
  return (
    <label className={styles.root}>
      <span
        className={[
          styles.field,
          surface === 'raised' ? styles.fieldRaised : surface === 'tint' ? styles.fieldTint : styles.fieldFrost,
        ].join(' ')}
      >
        <MagnifyingGlassIcon className={styles.icon} strokeWidth={1.75} aria-hidden />
        <input
          className={styles.input}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste transaction hash"
          spellCheck={false}
          autoComplete="off"
          inputMode="search"
          aria-label="Search by transaction hash"
        />
      </span>
    </label>
  )
}
