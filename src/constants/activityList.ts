import type {
  DashboardActivityItem,
  DashboardReceiveActivityItem,
  DashboardReceiveLinkActivityItem,
} from '@/constants/dashboardActivity'

export const ACTIVITY_LIST_MOBILE_PREVIEW_MAX = 6
export const ACTIVITY_LIST_DESKTOP_PREVIEW_MAX = 8
export const ACTIVITY_LIST_FADE_HEIGHT_PX = 100
export const DASHBOARD_ACTIVITY_BOTTOM_SPACING_PX = 120

/** Preview-only row so request/receive activity layouts can be reviewed in the dashboard list. */
export const DEMO_PREVIEW_RECEIVE_LINK_ITEM: DashboardReceiveLinkActivityItem = {
  id: '__demo_preview_receive_link__',
  kind: 'receiveLink',
  label: 'Received via payment link',
  amount: 1000,
  occurredAt: Date.now() - 5 * 60 * 1000,
  requestId: '__demo_preview_request__',
  paidAmount: 1000,
  txHash: '0xpreview000000000000000000000000000000000000000000000000000000',
}

/** Preview-only row for regular incoming transfers. */
export const DEMO_PREVIEW_RECEIVE_PAYMENT_ITEM: DashboardReceiveActivityItem = {
  id: '__demo_preview_receive_payment__',
  kind: 'receive',
  label: 'Received payment',
  amount: 500,
  occurredAt: Date.now() - 12 * 60 * 1000,
  sender: '0x8a3f2c91d4e5076b1c9a0f8e2d5b7c4a6e1f9032',
  chain: 'ethereum',
  txHash: '0xpreview111111111111111111111111111111111111111111111111111111',
}

export function isDemoPreviewActivityItem(item: { id: string }): boolean {
  return item.id.startsWith('__demo_preview_')
}

function hasReceiveLinkRow(items: readonly DashboardActivityItem[]): boolean {
  return items.some((item) => item.kind === 'receiveLink')
}

function hasReceivePaymentRow(items: readonly DashboardActivityItem[]): boolean {
  return items.some((item) => item.kind === 'receive')
}

/** Inserts preview receive rows (mock layout review) after the first real activity item. */
export function withDemoPreviewReceiveItem(
  items: readonly DashboardActivityItem[],
): DashboardActivityItem[] {
  const demosToInsert: DashboardActivityItem[] = []

  if (!hasReceiveLinkRow(items)) {
    demosToInsert.push(DEMO_PREVIEW_RECEIVE_LINK_ITEM)
  }

  if (!hasReceivePaymentRow(items)) {
    demosToInsert.push(DEMO_PREVIEW_RECEIVE_PAYMENT_ITEM)
  }

  if (demosToInsert.length === 0) {
    return [...items]
  }

  if (items.length === 0) {
    return demosToInsert
  }

  const [first, ...rest] = items
  return [first, ...demosToInsert, ...rest]
}
