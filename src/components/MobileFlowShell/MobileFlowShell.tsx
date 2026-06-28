import type { ReactNode } from 'react'
import styles from './MobileFlowShell.module.css'

export interface MobileFlowShellProps {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

/** Full-viewport step container for mobile transaction flows. */
export function MobileFlowShell({ header, footer, children }: MobileFlowShellProps) {
  return (
    <div className={styles.shell}>
      {header ? <header className={styles.header}>{header}</header> : null}
      <main className={styles.body}>{children}</main>
      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </div>
  )
}
