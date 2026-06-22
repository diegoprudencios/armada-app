import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import styles from './TechnicalDetailsDisclosure.module.css'

export interface TechnicalDetailsDisclosureProps {
  label?: string
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

export function TechnicalDetailsDisclosure({
  label = 'Show technical details',
  defaultOpen = false,
  children,
  className,
}: TechnicalDetailsDisclosureProps) {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return (
    <details className={cls} open={defaultOpen}>
      <summary className={styles.summary}>
        <ChevronRight className={styles.chevron} size={14} aria-hidden />
        <span>{label}</span>
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  )
}
