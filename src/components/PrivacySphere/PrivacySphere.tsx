import { useEffect, useRef, useState } from 'react'
import { useThreeScene } from './useThreeScene'
import styles from './PrivacySphere.module.css'

type ArrowPaths = {
  width: number
  height: number
  inLine: string
  inHead: string
  outLine: string
  outHead: string
}

const HEAD = 6

function localPoint(root: DOMRect, x: number, y: number) {
  return { x: x - root.left, y: y - root.top }
}

function measureArrows(
  rootEl: HTMLElement,
  labelInEl: HTMLElement,
  labelOutEl: HTMLElement,
  canvasEl: HTMLElement,
): ArrowPaths | null {
  const root = rootEl.getBoundingClientRect()
  if (root.width < 1 || root.height < 1) return null

  const labelIn = labelInEl.getBoundingClientRect()
  const labelOut = labelOutEl.getBoundingClientRect()
  const canvas = canvasEl.getBoundingClientRect()

  const sphereCx = canvas.left + canvas.width / 2
  const sphereCy = canvas.top + canvas.height / 2
  /* Outer wire radius ≈ 36% of the shorter canvas side at current camera framing. */
  const sphereR = Math.min(canvas.width, canvas.height) * 0.36

  /* Wallet: mid-bottom of box → down to sphere mid-Y → right into sphere mid-left. */
  const inStart = localPoint(root, labelIn.left + labelIn.width / 2, labelIn.bottom)
  const inMidY = localPoint(root, 0, sphereCy).y
  const inEnd = localPoint(root, sphereCx - sphereR, sphereCy)

  /* Any address: sphere mid-right → right to box mid-X → down into mid-top of box. */
  const outStart = localPoint(root, sphereCx + sphereR, sphereCy)
  const outEnd = localPoint(root, labelOut.left + labelOut.width / 2, labelOut.top)
  const outCorner = { x: outEnd.x, y: outStart.y }

  return {
    width: root.width,
    height: root.height,
    inLine: `M ${inStart.x} ${inStart.y} L ${inStart.x} ${inMidY} L ${inEnd.x} ${inEnd.y}`,
    inHead: `M ${inEnd.x - HEAD} ${inEnd.y - HEAD * 0.65} L ${inEnd.x} ${inEnd.y} L ${inEnd.x - HEAD} ${inEnd.y + HEAD * 0.65}`,
    outLine: `M ${outStart.x} ${outStart.y} L ${outCorner.x} ${outCorner.y} L ${outEnd.x} ${outEnd.y}`,
    outHead: `M ${outEnd.x - HEAD * 0.65} ${outEnd.y - HEAD} L ${outEnd.x} ${outEnd.y} L ${outEnd.x + HEAD * 0.65} ${outEnd.y - HEAD}`,
  }
}

/**
 * Wallet → shielded pool → any address diagram with a rotating three.js
 * wireframe sphere, blurred asset cluster, and orbiting USDC sprites.
 *
 * Elbow arrows are measured from label midpoints to the sphere midline
 * so they stay aligned as the stage resizes.
 */
export function PrivacySphere() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const labelInRef = useRef<HTMLDivElement>(null)
  const labelOutRef = useRef<HTMLDivElement>(null)
  const [arrows, setArrows] = useState<ArrowPaths | null>(null)

  useThreeScene(canvasHostRef)

  useEffect(() => {
    const rootEl = rootRef.current
    const canvasEl = canvasHostRef.current
    const labelInEl = labelInRef.current
    const labelOutEl = labelOutRef.current
    if (!rootEl || !canvasEl || !labelInEl || !labelOutEl) return

    const update = () => {
      setArrows(measureArrows(rootEl, labelInEl, labelOutEl, canvasEl))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(rootEl)
    observer.observe(labelInEl)
    observer.observe(labelOutEl)
    if (typeof document !== 'undefined' && 'fonts' in document) {
      void document.fonts.ready.then(update)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={rootRef}
      className={styles.root}
      role="img"
      aria-label="Diagram: your wallet connects through Armada's private pool to any address, with USDC moving around a shielded sphere"
    >
      <div ref={canvasHostRef} className={styles.canvasHost} />

      {arrows ? (
        <svg
          className={styles.arrowOverlay}
          viewBox={`0 0 ${arrows.width} ${arrows.height}`}
          width={arrows.width}
          height={arrows.height}
          fill="none"
          aria-hidden
          focusable="false"
        >
          <path d={arrows.inLine} className={styles.arrowStroke} />
          <path d={arrows.inHead} className={styles.arrowStroke} />
          <path d={arrows.outLine} className={styles.arrowStroke} />
          <path d={arrows.outHead} className={styles.arrowStroke} />
        </svg>
      ) : null}

      <div ref={labelInRef} className={`${styles.labelBox} ${styles.labelIn}`}>
        Your wallet
      </div>
      <div ref={labelOutRef} className={`${styles.labelBox} ${styles.labelOut}`}>
        Any address
      </div>
    </div>
  )
}
