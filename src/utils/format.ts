export function formatUsdcAmount(value: number, fractionDigits = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  })
}

export function formatWalletBalance(value: number): string {
  return formatUsdcAmount(value, 2)
}

/** Ellipsis in the middle for long strings (addresses, URLs). */
export function truncateMiddle(text: string, maxLength = 52): string {
  if (text.length <= maxLength) return text

  const ellipsis = '…'
  const visible = maxLength - ellipsis.length
  const head = Math.ceil(visible / 2)
  const tail = Math.floor(visible / 2)
  return `${text.slice(0, head)}${ellipsis}${text.slice(-tail)}`
}

let measureCanvas: HTMLCanvasElement | null = null

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  if (!measureCanvas) measureCanvas = document.createElement('canvas')
  return measureCanvas.getContext('2d')
}

/**
 * Middle-truncate `text` to the longest string that fits within `maxWidthPx`
 * when drawn with the given CSS `font` (e.g. from getComputedStyle).
 */
export function truncateMiddleToWidth(text: string, maxWidthPx: number, font: string): string {
  if (!text || maxWidthPx <= 0) return text

  const ctx = getMeasureContext()
  if (!ctx) return truncateMiddle(text, 22)

  ctx.font = font
  if (ctx.measureText(text).width <= maxWidthPx) return text

  let lo = 3
  let hi = text.length - 1
  let best = truncateMiddle(text, 3)

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const candidate = truncateMiddle(text, mid)
    if (ctx.measureText(candidate).width <= maxWidthPx) {
      best = candidate
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return best
}

export function truncateAddress(address: string): string {
  if (address.length <= 13) return address
  return `${address.slice(0, 6)}...${address.slice(-5)}`
}

/** Shielded / Armada zk address — slightly longer tail for readability. */
export function truncateArmadaAddress(address: string): string {
  if (address.length <= 15) return address
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}
