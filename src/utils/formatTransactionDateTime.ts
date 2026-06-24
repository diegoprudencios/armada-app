const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const TIME_FORMAT = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

/** Single-line date and time for transaction confirmations. */
export function formatTransactionDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  return `${DATE_FORMAT.format(date)} · ${TIME_FORMAT.format(date)}`
}
