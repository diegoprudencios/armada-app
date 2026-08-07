import { useEffect, useRef, useState } from 'react'
import usdcLogoUrl from '@/assets/usdc-logo.svg'
import { useThreeScene } from './useThreeScene'
import styles from './PrivacySphere.module.css'

type ConnectorPaths = {
  width: number
  height: number
  inLine: string
  outLine: string
  /** Full wallet → through sphere → address path for the traveler. */
  travelPath: string
  sphereLeft: number
  sphereRight: number
}

type LabelLayout = {
  inLeft: number
  inTop: number
  outLeft: number
  outTop: number
}

/** Elbow fillet — matches Figma rounded connector (~spacing-5). */
const CORNER_R = 20
/** Horizontal run into/out of the sphere rim (~50px). Boxes move to keep the drop centered. */
const HORIZONTAL_RUN = 48 // --primitives-spacing-12
/** EXCEPTION — Figma label pill size. */
const LABEL_WIDTH = 180
const LABEL_HEIGHT = 56
/** Gap from sphere top edge — --primitives-spacing-8. */
const LABEL_EDGE_GAP = 32

const TRAVEL_DURATION_MS = 7200
const TRAVEL_PAUSE_MS = 2600

/**
 * Must stay in sync with useThreeScene camera framing.
 * Used to place connector endpoints on the true perspective silhouette.
 */
const SPHERE_RADIUS = 2.4
const CAMERA_Z = 8.0
const CAMERA_FOV_DEG = 45

/** Screen-space radius (px) of the sphere silhouette for the current canvas size. */
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

/**
 * Box → sphere (left): vertical from box center, rounded elbow, horizontal to rim.
 */
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

/**
 * Sphere (right) → box: horizontal from rim, rounded elbow, vertical down into box.
 */
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
  canvasEl: HTMLElement,
): { connectors: ConnectorPaths; labels: LabelLayout } | null {
  const root = rootEl.getBoundingClientRect()
  if (root.width < 1 || root.height < 1) return null

  const canvas = canvasEl.getBoundingClientRect()

  const sphereCx = canvas.left + canvas.width / 2
  const sphereCy = canvas.top + canvas.height / 2
  /* True silhouette rim; −0.5px so the 1px stroke sits outside the wire, not over it. */
  const sphereR = silhouettePixelRadius(canvas.height) - 0.5
  const sphereLeft = localPoint(root, sphereCx - sphereR, sphereCy)
  const sphereRight = localPoint(root, sphereCx + sphereR, sphereCy)
  const midY = sphereLeft.y
  const cx = (sphereLeft.x + sphereRight.x) / 2
  const sphereTop = midY - sphereR
  const sphereBottom = midY + sphereR

  const labels: LabelLayout = {
    inLeft: sphereLeft.x - HORIZONTAL_RUN - LABEL_WIDTH / 2,
    inTop: sphereTop + LABEL_EDGE_GAP,
    outLeft: sphereRight.x + HORIZONTAL_RUN - LABEL_WIDTH / 2,
    outTop: sphereBottom - LABEL_EDGE_GAP - LABEL_HEIGHT,
  }

  const inX = labels.inLeft + LABEL_WIDTH / 2
  const outX = labels.outLeft + LABEL_WIDTH / 2
  const labelInBottom = labels.inTop + LABEL_HEIGHT
  const labelOutTop = labels.outTop

  /* Connectors meet the pill edges; traveler starts/ends at pill centers so the
     USDC is fully covered by the box (no half-peek at handoff). */
  const inAttach = { x: inX, y: labelInBottom }
  const outAttach = { x: outX, y: labelOutTop }
  const inTravelStart = { x: inX, y: labels.inTop + LABEL_HEIGHT / 2 }
  const outTravelEnd = { x: outX, y: labels.outTop + LABEL_HEIGHT / 2 }

  const inLine = pathBoxToSphereLeft(inAttach, midY, sphereLeft.x, CORNER_R)
  const outLine = pathSphereRightToBox(sphereRight.x, midY, outAttach, CORNER_R)
  const travelIn = pathBoxToSphereLeft(inTravelStart, midY, sphereLeft.x, CORNER_R)
  const travelOut = pathSphereRightToBox(sphereRight.x, midY, outTravelEnd, CORNER_R)
  /* Through the pool: slight dip so the coin reads as entering the volume. */
  const through = `L ${cx} ${midY + Math.min(28, sphereR * 0.22)} L ${sphereRight.x} ${midY}`
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
    },
  }
}

/**
 * Wallet → shielded pool → any address diagram with a rotating three.js
 * wireframe sphere, blurred asset cluster, and orbiting privacy-eye badges.
 *
 * A small USDC periodically rides the connectors, dips through the sphere,
 * and exits toward any address. Labels sit under the WebGL canvas so orbiting
 * privacy-eye badges paint over the boxes.
 */
export function PrivacySphere() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const labelInRef = useRef<HTMLDivElement>(null)
  const labelOutRef = useRef<HTMLDivElement>(null)
  const travelPathRef = useRef<SVGPathElement>(null)
  const travelerRef = useRef<HTMLImageElement>(null)
  const [connectors, setConnectors] = useState<ConnectorPaths | null>(null)
  const [labelLayout, setLabelLayout] = useState<LabelLayout | null>(null)

  useThreeScene(canvasHostRef)

  useEffect(() => {
    const rootEl = rootRef.current
    const canvasEl = canvasHostRef.current
    if (!rootEl || !canvasEl) return

    const update = () => {
      const next = measureLayout(rootEl, canvasEl)
      if (!next) return
      setLabelLayout(next.labels)
      setConnectors(next.connectors)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(rootEl)
    observer.observe(canvasEl)
    if (typeof document !== 'undefined' && 'fonts' in document) {
      void document.fonts.ready.then(update)
    }

    return () => observer.disconnect()
  }, [])

  /* Periodic traveler along wallet → sphere → address. */
  useEffect(() => {
    if (!connectors) return
    const pathEl = travelPathRef.current
    const travelerEl = travelerRef.current
    if (!pathEl || !travelerEl) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) {
      travelerEl.style.opacity = '0'
      return
    }

    let frameId = 0
    let timeoutId = 0
    let startTime = 0
    let running = true

    const totalLength = pathEl.getTotalLength()
    if (totalLength < 1) return

    const place = (t: number) => {
      const point = pathEl.getPointAtLength(t * totalLength)
      const inside =
        point.x > connectors.sphereLeft && point.x < connectors.sphereRight
      const scale = inside ? 0.72 : 1
      travelerEl.style.opacity = inside ? '0.85' : '1'
      travelerEl.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%) scale(${scale})`
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
      travelerEl.style.opacity = '0'
      timeoutId = window.setTimeout(startTrip, TRAVEL_PAUSE_MS)
    }

    const startTrip = () => {
      if (!running) return
      startTime = performance.now()
      travelerEl.style.opacity = '1'
      frameId = window.requestAnimationFrame(tick)
    }

    place(0)
    travelerEl.style.opacity = '0'
    timeoutId = window.setTimeout(startTrip, 900)

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
      aria-label="Diagram: your wallet connects through Armada's private pool to any address, with USDC moving around a shielded sphere"
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
          <path
            ref={travelPathRef}
            d={connectors.travelPath}
            className={styles.travelPath}
          />
        </svg>
      ) : null}

      <div
        ref={labelInRef}
        className={`${styles.labelBox} ${styles.labelIn}`}
        style={
          labelLayout
            ? { left: labelLayout.inLeft, top: labelLayout.inTop }
            : undefined
        }
      >
        Your wallet
      </div>
      <div
        ref={labelOutRef}
        className={`${styles.labelBox} ${styles.labelOut}`}
        style={
          labelLayout
            ? { left: labelLayout.outLeft, top: labelLayout.outTop }
            : undefined
        }
      >
        Any address
      </div>

      <div ref={canvasHostRef} className={styles.canvasHost} />

      <img
        ref={travelerRef}
        className={styles.traveler}
        src={usdcLogoUrl}
        alt=""
        aria-hidden
        draggable={false}
      />
    </div>
  )
}
