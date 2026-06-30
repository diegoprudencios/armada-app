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

export function truncateAddress(address: string): string {
  if (address.length <= 13) return address
  return `${address.slice(0, 6)}...${address.slice(-5)}`
}

/** Shielded / Armada zk address — slightly longer tail for readability. */
export function truncateArmadaAddress(address: string): string {
  if (address.length <= 15) return address
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}
