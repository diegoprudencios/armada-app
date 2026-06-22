import { useMemo, type CSSProperties } from 'react'
import styles from './BalancePixelMask.module.css'

const MASK_ROWS = 8

function gridDimensionsForSeed(seed: string): { cols: number; rows: number } {
  const cols = Math.max(14, Math.min(26, seed.length * 3 + 4))
  return { cols, rows: MASK_ROWS }
}

function buildPixelCells(seed: string, cols: number, rows: number): boolean[] {
  const cells = Array.from({ length: cols * rows }, () => false)
  let state = 0

  for (let i = 0; i < seed.length; i += 1) {
    state = (state * 31 + seed.charCodeAt(i)) | 0
  }
  state = Math.abs(state) || 1

  for (let i = 0; i < cells.length; i += 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    cells[i] = state % 100 < 62
  }

  const markCorner = (col: number, row: number) => {
    for (let y = 0; y < 3; y += 1) {
      for (let x = 0; x < 3; x += 1) {
        const index = (row + y) * cols + (col + x)
        const edge = x === 0 || x === 2 || y === 0 || y === 2
        cells[index] = edge || (x === 1 && y === 1)
      }
    }
  }

  if (cols >= 3 && rows >= 3) {
    markCorner(0, 0)
    markCorner(cols - 3, 0)
    markCorner(0, rows - 3)
  }

  return cells
}

export interface BalancePixelMaskProps {
  seed: string
  className?: string
}

export function BalancePixelMask({ seed, className }: BalancePixelMaskProps) {
  const { cols, rows } = useMemo(() => gridDimensionsForSeed(seed), [seed])
  const cells = useMemo(() => buildPixelCells(seed, cols, rows), [seed, cols, rows])

  const rootClassName = [styles.grid, className].filter(Boolean).join(' ')

  return (
    <span
      className={rootClassName}
      style={
        {
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {cells.map((filled, index) => (
        <span
          key={index}
          className={
            filled
              ? `${styles.cellFilled} ${styles.cellFilledAnimated}`
              : styles.cellEmpty
          }
          style={{ '--pixel-index': index % 24 } as CSSProperties}
        />
      ))}
    </span>
  )
}
