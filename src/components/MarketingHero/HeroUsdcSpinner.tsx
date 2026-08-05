import { useMemo, type CSSProperties } from 'react'
import TokenUSDC from '@web3icons/react/icons/tokens/TokenUSDC'
import styles from './HeroUsdcSpinner.module.css'

const TICK_COUNT = 60
/** Visible USDC circle ≈ 48px; branded glyph is 18/24 of the SVG box. */
const TOKEN_SIZE = Math.round((48 * 24) / 18)

export interface HeroUsdcSpinnerProps {
  className?: string
}

/** 160×160 USDC mark with the app processing tick-ring spinner. */
export function HeroUsdcSpinner({ className }: HeroUsdcSpinnerProps) {
  const ticks = useMemo(() => Array.from({ length: TICK_COUNT }, (_, index) => index), [])
  const rootClassName = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={rootClassName} aria-hidden>
      <div className={styles.tickRing}>
        {ticks.map((index) => (
          <span key={index} className={styles.tick} style={{ '--i': index } as CSSProperties} />
        ))}
      </div>
      <TokenUSDC size={TOKEN_SIZE} variant="branded" className={styles.token} />
    </div>
  )
}
