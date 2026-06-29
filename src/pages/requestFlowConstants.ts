export const REQUEST_PROGRESS_STEPS = ['Receive', 'Share link'] as const

export type RequestModalStep = 'receive' | 'link'

export const REQUEST_LINK_EXPIRY_OPTIONS = [
  { id: '1d', label: '1 day', ms: 86_400_000 },
  { id: '7d', label: '7 days', ms: 7 * 86_400_000 },
  { id: '30d', label: '30 days', ms: 30 * 86_400_000 },
] as const

export type RequestLinkExpiryId = (typeof REQUEST_LINK_EXPIRY_OPTIONS)[number]['id']

export const DEFAULT_REQUEST_LINK_EXPIRY_ID: RequestLinkExpiryId = '7d'

export const REQUEST_NOTE_MAX_LENGTH = 120

export function requestLinkExpiryMs(expiryId: RequestLinkExpiryId): number {
  return REQUEST_LINK_EXPIRY_OPTIONS.find((option) => option.id === expiryId)?.ms ?? 7 * 86_400_000
}

export function createPaymentRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Demo one-time routing address for payment links.
 * Production: Armada registers an alias server-side; the link never exposes the user's primary shielded address.
 */
export function createPaymentRoutingAddress(requestId: string, recipientAddress: string): string {
  const mixed = Array.from({ length: 58 }, (_, index) => {
    const a = requestId.charCodeAt(index % requestId.length)
    const b = recipientAddress.charCodeAt(index % recipientAddress.length)
    return ((a ^ b ^ index) % 16).toString(16)
  }).join('')

  return `zK${mixed}`
}

export type BuildPayViaLinkInput = {
  routingAddress: string
  requestId: string
  expiresAt: number
  amount?: string
  note?: string
}

export function buildPayViaLinkUrl({
  routingAddress,
  requestId,
  expiresAt,
  amount,
  note,
}: BuildPayViaLinkInput): string {
  const url = new URL('/pay-via-link', window.location.origin)
  url.searchParams.set('to', routingAddress)
  url.searchParams.set('id', requestId)
  url.searchParams.set('expires', String(expiresAt))

  const trimmedAmount = amount?.trim()
  if (trimmedAmount) {
    url.searchParams.set('amount', trimmedAmount)
  }

  const trimmedNote = note?.trim()
  if (trimmedNote) {
    url.searchParams.set('note', trimmedNote)
  }

  return url.toString()
}

export function formatPaymentLinkExpiry(expiresAt: number, now = Date.now()): string {
  const diffMs = expiresAt - now
  if (diffMs <= 0) return 'Expired'

  const diffDays = Math.ceil(diffMs / 86_400_000)
  if (diffDays === 1) return 'Expires in 1 day'
  return `Expires in ${diffDays} days`
}
