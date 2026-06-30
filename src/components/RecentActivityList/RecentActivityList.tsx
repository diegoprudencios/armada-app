import { useState, type ComponentType, type SVGProps } from 'react'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ClockIcon,
  LinkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { BalanceScrambleValue } from '@/components/BalanceScrambleValue'
import {
  ACTIVITY_LIST_DESKTOP_PREVIEW_MAX,
  ACTIVITY_LIST_MOBILE_PREVIEW_MAX,
} from '@/constants/activityList'
import type { DashboardActivityItem, DashboardActivityKind } from '@/constants/dashboardActivity'
import { useMobileLayout } from '@/hooks/useMobileLayout'
import { formatPaymentLinkExpiry } from '@/pages/requestFlowConstants'
import { formatUsdcAmount } from '@/utils/format'
import { formatTimeAgo } from '@/utils/formatTimeAgo'
import usdcAmount from '@/styles/usdcAmount.module.css'
import { ActivityAllPanel } from './ActivityAllPanel'
import styles from './RecentActivityList.module.css'

const ACTIVITY_ICONS: Record<
  DashboardActivityKind,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  send: ArrowRightIcon,
  deposit: PlusIcon,
  earn: ChartBarIcon,
  withdraw: ArrowLeftIcon,
  requestLink: LinkIcon,
  receiveLink: ArrowDownIcon,
  receive: ArrowDownIcon,
}

function formatSignedAmount(amount: number): string {
  const absolute = formatUsdcAmount(Math.abs(amount))
  if (amount > 0) return `+${absolute}`
  if (amount < 0) return `-${absolute}`
  return absolute
}

function formatActivitySubtitle(item: DashboardActivityItem): string {
  const timeAgo = formatTimeAgo(item.occurredAt)

  if (item.kind === 'requestLink' && item.status === 'pending') {
    return `${timeAgo} • Pending • ${formatPaymentLinkExpiry(item.expiresAt)}`
  }

  return timeAgo
}

function activityAmountTone(item: DashboardActivityItem, balanceRevealed: boolean): string {
  if (!balanceRevealed) return ''

  if (item.kind === 'requestLink' && item.status === 'pending') {
    return ''
  }

  if (item.amount > 0) return styles.amountPositive
  if (item.amount < 0) return styles.amountNegative
  return ''
}

export type RecentActivityListVariant = 'preview' | 'full'

export interface RecentActivityListProps {
  items: readonly DashboardActivityItem[]
  balanceRevealed?: boolean
  variant?: RecentActivityListVariant
  onItemClick?: (item: DashboardActivityItem) => void
}

interface ActivityListItemsProps {
  items: readonly DashboardActivityItem[]
  balanceRevealed: boolean
  onItemClick?: (item: DashboardActivityItem) => void
}

function ActivityListItems({ items, balanceRevealed, onItemClick }: ActivityListItemsProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const Icon = ACTIVITY_ICONS[item.kind]
        const signedAmount = formatSignedAmount(item.amount)
        const amountLabel = signedAmount
        const amountTone = activityAmountTone(item, balanceRevealed)

        return (
          <li key={item.id}>
            <button
              type="button"
              className={styles.item}
              onClick={() => onItemClick?.(item)}
            >
              <span className={styles.iconBadge} aria-hidden>
                <Icon className={styles.icon} strokeWidth={1.5} />
              </span>
              <div className={styles.copy}>
                <span className={styles.label}>{item.label}</span>
                <span className={styles.time}>{formatActivitySubtitle(item)}</span>
              </div>
              <span
                className={[styles.amount, usdcAmount.font, amountTone].filter(Boolean).join(' ')}
                aria-label={balanceRevealed ? amountLabel : 'Amount hidden'}
              >
                <BalanceScrambleValue value={signedAmount} revealed={balanceRevealed} />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function RecentActivityList({
  items,
  balanceRevealed = true,
  variant = 'preview',
  onItemClick,
}: RecentActivityListProps) {
  const isMobile = useMobileLayout()
  const [allOpen, setAllOpen] = useState(false)
  const isPreview = variant === 'preview'
  const previewMax = isMobile ? ACTIVITY_LIST_MOBILE_PREVIEW_MAX : ACTIVITY_LIST_DESKTOP_PREVIEW_MAX
  const previewItems = isPreview ? items.slice(0, previewMax) : items
  const showViewAll = isPreview && items.length > previewMax

  const rootClassName = [styles.root, isPreview ? styles.rootPreview : styles.rootFull]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <section className={rootClassName} aria-label="Recent activity">
        {isPreview ? (
          <div className={styles.headerRow}>
            <h2 className={styles.heading}>Recent activity</h2>
            {showViewAll ? (
              <button type="button" className={styles.viewAllButton} onClick={() => setAllOpen(true)}>
                View all
              </button>
            ) : null}
          </div>
        ) : null}

        {previewItems.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIconBadge} aria-hidden>
              <ClockIcon className={styles.emptyIcon} strokeWidth={1.5} />
            </span>
            <p className={styles.emptyTitle}>No activity yet</p>
            <p className={styles.emptyBody}>
              Deposits, sends, payment links, and earn moves will show up here.
            </p>
          </div>
        ) : (
          <ActivityListItems
            items={previewItems}
            balanceRevealed={balanceRevealed}
            onItemClick={onItemClick}
          />
        )}
      </section>

      {isPreview ? (
        <ActivityAllPanel
          open={allOpen}
          onClose={() => setAllOpen(false)}
          items={items}
          balanceRevealed={balanceRevealed}
          onItemClick={onItemClick}
        />
      ) : null}
    </>
  )
}
