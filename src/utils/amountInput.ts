import { formatWalletBalance } from '@/utils/format'

/** Strip thousand-separator commas; canonical storage uses digits + optional decimal dot. */
export function stripAmountGrouping(value: string): string {
  return value.replace(/,/g, '')
}

/** Sanitize free-form decimal entry (digits + single dot, max 2 decimal places). */
export function sanitizeAmountInput(raw: string): string {
  const normalized = stripAmountGrouping(raw)
  let out = ''
  let seenDecimal = false
  let decimalPlaces = 0
  for (const char of normalized) {
    if (char >= '0' && char <= '9') {
      if (seenDecimal) {
        if (decimalPlaces >= 2) continue
        decimalPlaces += 1
      }
      out += char
      continue
    }
    if (char === '.' && !seenDecimal) {
      seenDecimal = true
      out += char
    }
  }
  return out
}

/** Format sanitized amount for display with en-US thousand grouping (1,000 / 1,000,000). */
export function formatAmountInputDisplay(sanitized: string): string {
  if (!sanitized) return ''

  const decimalIndex = sanitized.indexOf('.')
  const intPart = decimalIndex === -1 ? sanitized : sanitized.slice(0, decimalIndex)
  const decSuffix = decimalIndex === -1 ? '' : sanitized.slice(decimalIndex)

  if (!intPart) {
    return decSuffix ? `0${decSuffix}` : ''
  }

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${formattedInt}${decSuffix}`
}

/** Normalize numeric entry from buttons (Max / %) to sanitized storage. */
export function formatSanitizedAmountFromNumber(value: number): string {
  return sanitizeAmountInput(formatWalletBalance(value))
}

/** True when the user has a non-zero amount or is mid-decimal entry (e.g. "0."). */
export function hasActiveAmount(value: string): boolean {
  const trimmed = stripAmountGrouping(value).trim()
  if (!trimmed || trimmed === '.') return false
  if (trimmed.endsWith('.')) return true
  const num = parseFloat(trimmed)
  return !Number.isNaN(num) && num !== 0
}

/** Parse active input to a capped numeric amount; zero when inactive or invalid. */
export function parseActiveAmount(value: string, cap = Infinity): number {
  if (!hasActiveAmount(value)) return 0
  const num = parseFloat(stripAmountGrouping(value))
  if (Number.isNaN(num)) return 0
  return Math.min(Math.max(0, num), cap)
}

/** Append a digit from a custom keypad (max 2 decimal places). */
export function applyKeypadDigit(current: string, digit: string): string {
  if (!/^\d$/.test(digit)) return sanitizeAmountInput(current)
  return sanitizeAmountInput(`${stripAmountGrouping(current)}${digit}`)
}

/** Insert a decimal point from a custom keypad. */
export function applyKeypadDecimal(current: string): string {
  const normalized = stripAmountGrouping(current)
  if (!normalized) return '0.'
  if (normalized.includes('.')) return sanitizeAmountInput(normalized)
  return sanitizeAmountInput(`${normalized}.`)
}

/** Remove the last character from keypad entry. */
export function applyKeypadBackspace(current: string): string {
  const normalized = stripAmountGrouping(current)
  if (!normalized) return ''
  return sanitizeAmountInput(normalized.slice(0, -1))
}

/** True when the entered amount is greater than the available balance. */
export function amountExceedsBalance(amount: string, balance: number): boolean {
  if (!hasActiveAmount(amount)) return false
  return parseActiveAmount(amount) > balance
}
