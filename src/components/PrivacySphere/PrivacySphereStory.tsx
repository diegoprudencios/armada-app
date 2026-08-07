import { useEffect, useRef, useState } from 'react'
import usdcLogoUrl from '@/assets/usdc-logo.svg'
import { useThreeScene } from './useThreeScene'
import styles from './PrivacySphere.module.css'

type ConnectorPaths = {
  width: number
  height: number
  inLine: string
  outLine: string
  /** Full wallet → through sphere → address path. */
  travelPath: string
  sphereLeft: number
  sphereRight: number
  sphereCx: number
  sphereCy: number
  sphereR: number
}

type LabelLayout = {
  inLeft: number
  outLeft: number
}

/** Elbow fillet — matches Figma rounded connector (~spacing-5). */
const CORNER_R = 20
/** Horizontal run into/out of the sphere rim (~50px). */
const HORIZONTAL_RUN = 48 // --primitives-spacing-12

const TRAVEL_DURATION_MS = 7200
const TRAVEL_PAUSE_MS = 2400

/**
 * Must stay in sync with useThreeScene camera framing.
 */
const SPHERE_RADIUS = 2.4
const CAMERA_Z = 8.0
const CAMERA_FOV_DEG = 45

function silhouettePixelRadius(canvasHeight: number): number {
  const fovRad = (CAMERA_FOV_DEG * Math.PI) / 180
  const silZ = (SPHERE_RADIUS * SPHERE_RADIUS) / CAMERA_Z
  const silR =
    SPHERE_RADIUS * Math.sqrt(1 - (SPHERE_RADIUS * SPHERE_RADIUS) / (CAMERA_Z * CAMERA_Z))
  const distToPlane = CAMERA_Z - silZ
  const visibleHeight = 2 * Math.tan(fovRad / 2) * distToPlane
  return (silR / visibleHeight) * canvasHeight
}

function localPoint(root: DOMRect, x: number, y: number) {
  return { x: x - root.left, y: y - root.top }
}

function clampCorner(
  requested: number,
  verticalRun: number,
  horizontalRun: number,
): number {
  return Math.max(0, Math.min(requested, Math.abs(verticalRun) - 1, Math.abs(horizontalRun) - 1))
}

function pathBoxToSphereLeft(
  start: { x: number; y: number },
  midY: number,
  sphereLeft: number,
  cornerR: number,
): string {
  const r = clampCorner(cornerR, midY - start.y, sphereLeft - start.x)
  if (r < 2) {
    return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${sphereLeft} ${midY}`
  }
  return [
    `M ${start.x} ${start.y}`,
    `L ${start.x} ${midY - r}`,
    `Q ${start.x} ${midY} ${start.x + r} ${midY}`,
    `L ${sphereLeft} ${midY}`,
  ].join(' ')
}

function pathSphereRightToBox(
  sphereRight: number,
  midY: number,
  end: { x: number; y: number },
  cornerR: number,
): string {
  const r = clampCorner(cornerR, end.y - midY, end.x - sphereRight)
  if (r < 2) {
    return `M ${sphereRight} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`
  }
  return [
    `M ${sphereRight} ${midY}`,
    `L ${end.x - r} ${midY}`,
    `Q ${end.x} ${midY} ${end.x} ${midY + r}`,
    `L ${end.x} ${end.y}`,
  ].join(' ')
}

function measureLayout(
  rootEl: HTMLElement,
  labelInEl: HTMLElement,
  labelOutEl: HTMLElement,
  canvasEl: HTMLElement,
): { connectors: ConnectorPaths; labels: LabelLayout } | null {
  const root = rootEl.getBoundingClientRect()
  if (root.width < 1 || root.height < 1) return null

  const labelIn = labelInEl.getBoundingClientRect()
  const labelOut = labelOutEl.getBoundingClientRect()
  const canvas = canvasEl.getBoundingClientRect()

  const sphereCxScreen = canvas.left + canvas.width / 2
  const sphereCyScreen = canvas.top + canvas.height / 2
  const sphereR = silhouettePixelRadius(canvas.height) - 0.5
  const sphereLeft = localPoint(root, sphereCxScreen - sphereR, sphereCyScreen)
  const sphereRight = localPoint(root, sphereCxScreen + sphereR, sphereCyScreen)
  const midY = sphereLeft.y
  const sphereCx = (sphereLeft.x + sphereRight.x) / 2
  const sphereCy = midY

  const labels: LabelLayout = {
    inLeft: sphereLeft.x - HORIZONTAL_RUN - labelIn.width / 2,
    outLeft: sphereRight.x + HORIZONTAL_RUN - labelOut.width / 2,
  }

  const inX = labels.inLeft + labelIn.width / 2
  const outX = labels.outLeft + labelOut.width / 2
  const labelInTop = localPoint(root, 0, labelIn.top).y
  const labelInBottom = localPoint(root, 0, labelIn.bottom).y
  const labelOutTop = localPoint(root, 0, labelOut.top).y
  const labelOutBottom = localPoint(root, 0, labelOut.bottom).y

  /* Connectors meet the pill edges; traveler starts/ends at pill centers so the
     USDC is fully covered by the box (no half-peek at handoff). */
  const inAttach = { x: inX, y: labelInBottom }
  const outAttach = { x: outX, y: labelOutTop }
  const inTravelStart = { x: inX, y: (labelInTop + labelInBottom) / 2 }
  const outTravelEnd = { x: outX, y: (labelOutTop + labelOutBottom) / 2 }

  const inLine = pathBoxToSphereLeft(inAttach, midY, sphereLeft.x, CORNER_R)
  const outLine = pathSphereRightToBox(sphereRight.x, midY, outAttach, CORNER_R)
  const travelIn = pathBoxToSphereLeft(inTravelStart, midY, sphereLeft.x, CORNER_R)
  const travelOut = pathSphereRightToBox(sphereRight.x, midY, outTravelEnd, CORNER_R)
  /* Straight through the pool (slight dip so it reads inside the volume). */
  const through = `L ${sphereCx} ${midY + Math.min(28, sphereR * 0.22)} L ${sphereRight.x} ${midY}`
  const outContinuation = travelOut.replace(/^M\s+[-\d.]+\s+[-\d.]+\s*/, '')

  return {
    labels,
    connectors: {
      width: root.width,
      height: root.height,
      inLine,
      outLine,
      travelPath: `${travelIn} ${through} ${outContinuation}`,
      sphereLeft: sphereLeft.x,
      sphereRight: sphereRight.x,
      sphereCx,
      sphereCy,
      sphereR,
    },
  }
}

function sphereMasks(cx: number, cy: number, r: number) {
  /* Hard cut at the silhouette so sharp/blur meet exactly on the rim (ref). */
  const inside = `radial-gradient(circle ${r}px at ${cx}px ${cy}px, #000 ${r - 0.5}px, transparent ${r}px)`
  const outside = `radial-gradient(circle ${r}px at ${cx}px ${cy}px, transparent ${r - 0.5}px, #000 ${r}px)`
  return { inside, outside }
}

/**
 * Story variant: one USDC rides wallet → through the pool → any address.
 * Two synced layers share the same position:
 * - sharp, masked to the outside of the silhouette
 * - blurred, masked to the inside
 * so the rim bisects the mark exactly as in the reference.
 */
export function PrivacySphereStory() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const labelInRef = useRef<HTMLDivElement>(null)
  const labelOutRef = useRef<HTMLDivElement>(null)
  const travelPathRef = useRef<SVGPathElement>(null)
  const sharpRef = useRef<HTMLImageElement>(null)
  const blurRef = useRef<HTMLImageElement>(null)
  const sharpLayerRef = useRef<HTMLDivElement>(null)
  const blurLayerRef = useRef<HTMLDivElement>(null)
  const [connectors, setConnectors] = useState<ConnectorPaths | null>(null)
  const [labelLayout, setLabelLayout] = useState<LabelLayout | null>(null)

  useThreeScene(canvasHostRef)

  useEffect(() => {
    const rootEl = rootRef.current
    const canvasEl = canvasHostRef.current
    const labelInEl = labelInRef.current
    const labelOutEl = labelOutRef.current
    if (!rootEl || !canvasEl || !labelInEl || !labelOutEl) return

    const update = () => {
      const next = measureLayout(rootEl, labelInEl, labelOutEl, canvasEl)
      if (!next) return
      setLabelLayout(next.labels)
      setConnectors(next.connectors)

      const { inside, outside } = sphereMasks(
        next.connectors.sphereCx,
        next.connectors.sphereCy,
        next.connectors.sphereR,
      )
      const blurLayer = blurLayerRef.current
      const sharpLayer = sharpLayerRef.current
      if (blurLayer) {
        blurLayer.style.webkitMaskImage = inside
        blurLayer.style.maskImage = inside
      }
      if (sharpLayer) {
        sharpLayer.style.webkitMaskImage = outside
        sharpLayer.style.maskImage = outside
      }
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

  useEffect(() => {
    if (!connectors) return
    const pathEl = travelPathRef.current
    const sharpEl = sharpRef.current
    const blurEl = blurRef.current
    if (!pathEl || !sharpEl || !blurEl) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) {
      sharpEl.style.opacity = '0'
      blurEl.style.opacity = '0'
      return
    }

    let frameId = 0
    let timeoutId = 0
    let startTime = 0
    let running = true
    const totalLength = pathEl.getTotalLength()
    if (totalLength < 1) return

    const hide = () => {
      sharpEl.style.opacity = '0'
      blurEl.style.opacity = '0'
    }

    const place = (t: number) => {
      const point = pathEl.getPointAtLength(t * totalLength)
      const transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`
      sharpEl.style.opacity = '1'
      blurEl.style.opacity = '1'
      sharpEl.style.transform = transform
      /* Slightly larger so the soft edge fills the clipped half like the ref. */
      blurEl.style.transform = `${transform} scale(1.2)`
    }

    const tick = (now: number) => {
      if (!running) return
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / TRAVEL_DURATION_MS)
      place(t)
      if (t < 1) {
        frameId = window.requestAnimationFrame(tick)
        return
      }
      hide()
      timeoutId = window.setTimeout(startTrip, TRAVEL_PAUSE_MS)
    }

    const startTrip = () => {
      if (!running) return
      startTime = performance.now()
      frameId = window.requestAnimationFrame(tick)
    }

    hide()
    timeoutId = window.setTimeout(startTrip, 700)

    return () => {
      running = false
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
    }
  }, [connectors])

  return (
    <div
      ref={rootRef}
      className={styles.root}
      role="img"
      aria-label="Diagram: a USDC token moves from your wallet through Armada's private pool to any address; inside the pool it appears blurred"
    >
      {connectors ? (
        <svg
          className={styles.connectorOverlay}
          viewBox={`0 0 ${connectors.width} ${connectors.height}`}
          width={connectors.width}
          height={connectors.height}
          fill="none"
          aria-hidden
          focusable="false"
        >
          <path d={connectors.inLine} className={styles.connectorStroke} />
          <path d={connectors.outLine} className={styles.connectorStroke} />
          <path ref={travelPathRef} d={connectors.travelPath} className={styles.travelPath} />
        </svg>
      ) : null}

      <div
        ref={labelInRef}
        className={`${styles.labelBox} ${styles.labelIn}`}
        style={labelLayout ? { left: labelLayout.inLeft } : undefined}
      >
        Your wallet
      </div>
      <div
        ref={labelOutRef}
        className={`${styles.labelBox} ${styles.labelOut}`}
        style={labelLayout ? { left: labelLayout.outLeft, right: 'auto' } : undefined}
      >
        Any address
      </div>

      {/* Blur under the canvas so meridian lines sit over the in-pool half (ref). */}
      <div ref={blurLayerRef} className={styles.travelerLayerBlur} aria-hidden>
        <img
          ref={blurRef}
          className={`${styles.traveler} ${styles.travelerBlur}`}
          src={usdcLogoUrl}
          alt=""
          draggable={false}
        />
      </div>

      <div ref={canvasHostRef} className={styles.canvasHost} />

      {/* Sharp above the canvas; masked out inside the silhouette. */}
      <div ref={sharpLayerRef} className={styles.travelerLayerSharp} aria-hidden>
        <img
          ref={sharpRef}
          className={styles.traveler}
          src={usdcLogoUrl}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  )
}
