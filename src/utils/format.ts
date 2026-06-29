export function formatUsdcAmount(value: number, fractionDigits = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  })
}

export function formatWalletBalance(value: number): string {
  return formatUsdcAmount(value, 2)
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
