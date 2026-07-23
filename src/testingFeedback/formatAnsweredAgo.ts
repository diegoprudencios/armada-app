import { formatTimeAgo } from '@/utils/formatTimeAgo'

/** e.g. "answered 2 min ago" / "answered Just now" */
export function formatAnsweredAgo(answeredAt: number, now = Date.now()): string {
  const ago = formatTimeAgo(answeredAt, now)
  if (ago === 'Just now') return 'answered just now'
  return `answered ${ago}`
}
