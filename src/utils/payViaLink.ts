import { isArmadaAddress } from '@/pages/sendFlowConstants'
import { hasActiveAmount, parseActiveAmount } from '@/utils/amountInput'

export type PayViaLinkParams = {
  recipient: string
  requestId: string
  expiresAt: number
  amount?: string
  note?: string
}

export type PayViaLinkParseResult =
  | { status: 'ok'; params: PayViaLinkParams }
  | { status: 'invalid' }
  | { status: 'expired'; expiresAt: number }
  | { status: 'revoked' }

export type PendingPayViaLink = PayViaLinkParams

const PENDING_PAY_VIA_LINK_KEY = 'armada-app-pending-pay-via-link'
const REVOKED_PAYMENT_LINKS_KEY = 'armada-app-revoked-payment-links'

function readRevokedPaymentLinkIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()

  try {
    const raw = window.sessionStorage.getItem(REVOKED_PAYMENT_LINKS_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((value): value is string => typeof value === 'string'))
  } catch {
    return new Set()
  }
}

function writeRevokedPaymentLinkIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(REVOKED_PAYMENT_LINKS_KEY, JSON.stringify([...ids]))
  } catch {
    // ignore quota / private mode
  }
}

export function revokePaymentLink(requestId: string): void {
  const ids = readRevokedPaymentLinkIds()
  ids.add(requestId)
  writeRevokedPaymentLinkIds(ids)
}

export function isPaymentLinkRevoked(requestId: string): boolean {
  return readRevokedPaymentLinkIds().has(requestId)
}

export function readPendingPayViaLink(): PendingPayViaLink | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(PENDING_PAY_VIA_LINK_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as PendingPayViaLink
    if (!parsed.recipient || !parsed.requestId || !parsed.expiresAt) return null
    return parsed
  } catch {
    return null
  }
}

export function writePendingPayViaLink(payload: PendingPayViaLink): void {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(PENDING_PAY_VIA_LINK_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function clearPendingPayViaLink(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(PENDING_PAY_VIA_LINK_KEY)
}

export function parsePayViaLinkSearch(search: string, now = Date.now()): PayViaLinkParseResult {
  const params = new URLSearchParams(search)
  const recipient = params.get('to')?.trim() ?? ''
  const requestId = params.get('id')?.trim() ?? ''
  const expiresRaw = params.get('expires')?.trim() ?? ''
  const amount = params.get('amount')?.trim() ?? ''
  const note = params.get('note')?.trim() ?? ''

  const expiresAt = Number.parseInt(expiresRaw, 10)
  if (!isArmadaAddress(recipient) || !requestId || !Number.isFinite(expiresAt) || expiresAt <= 0) {
    return { status: 'invalid' }
  }

  if (isPaymentLinkRevoked(requestId)) {
    return { status: 'revoked' }
  }

  if (expiresAt <= now) {
    return { status: 'expired', expiresAt }
  }

  if (amount && (!hasActiveAmount(amount) || parseActiveAmount(amount) <= 0)) {
    return { status: 'invalid' }
  }

  return {
    status: 'ok',
    params: {
      recipient,
      requestId,
      expiresAt,
      amount: amount || undefined,
      note: note || undefined,
    },
  }
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}
