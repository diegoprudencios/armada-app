import { isValidRecipientAddress } from '@/pages/sendFlowConstants'

export function clipboardLooksLikeRecipientAddress(text: string): boolean {
  return isValidRecipientAddress(text.trim())
}

export async function readRecipientFromClipboard(): Promise<string | null> {
  try {
    if (!navigator.clipboard?.readText) return null
    const text = (await navigator.clipboard.readText()).trim()
    return clipboardLooksLikeRecipientAddress(text) ? text : null
  } catch {
    return null
  }
}
