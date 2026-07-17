import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type SVGProps,
  type UIEvent,
} from 'react'
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
import { ACTIVITY_LIST_FADE_HEIGHT_PX } from '@/constants/activityList'
import type { DashboardActivityItem, DashboardActivityKind } from '@/constants/dashboardActivity'
import { formatPaymentLinkExpiry } from '@/pages/requestFlowConstants'
import { formatUsdcAmount } from '@/utils/format'
import { resolveRequestLinkActivityLabel } from '@/utils/dashboardActivity'
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

function formatActivityAmount(item: DashboardActivityItem): string {
  const absolute = formatUsdcAmount(Math.abs(item.amount))

  if (item.kind === 'requestLink') {
    return absolute
  }

  if (item.amount > 0) return `+${absolute}`
  if (item.amount < 0) return `-${absolute}`
  return absolute
}

function activityDisplayLabel(item: DashboardActivityItem): string {
  if (item.kind === 'requestLink') {
    return resolveRequestLinkActivityLabel(item.status)
  }

  return item.label
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

  if (item.kind === 'requestLink') {
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
        const amountLabel = formatActivityAmount(item)
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
                <span className={styles.label}>{activityDisplayLabel(item)}</span>
                <span className={styles.time}>{formatActivitySubtitle(item)}</span>
              </div>
              <span
                className={[styles.amount, usdcAmount.font, amountTone].filter(Boolean).join(' ')}
                aria-label={balanceRevealed ? amountLabel : 'Amount hidden'}
              >
                <BalanceScrambleValue value={amountLabel} revealed={balanceRevealed} />
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
  const [allOpen, setAllOpen] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)
  const listScrollRef = useRef<HTMLDivElement>(null)
  const isPreview = variant === 'preview'
  const showViewAll = isPreview

  const updateBottomFade = useCallback(() => {
    const el = listScrollRef.current
    if (!el) {
      setShowBottomFade(false)
      return
    }
    const canScroll = el.scrollHeight > el.clientHeight + 1
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    setShowBottomFade(canScroll && !atBottom)
  }, [])

  useEffect(() => {
    if (!isPreview) {
      setShowBottomFade(false)
      return
    }
    updateBottomFade()
    const el = listScrollRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => updateBottomFade())
    observer.observe(el)
    return () => observer.disconnect()
  }, [isPreview, items, updateBottomFade])

  function handleListScroll(event: UIEvent<HTMLDivElement>) {
    const el = event.currentTarget
    const canScroll = el.scrollHeight > el.clientHeight + 1
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    setShowBottomFade(canScroll && !atBottom)
  }

  const rootClassName = [styles.root, isPreview ? styles.rootPreview : styles.rootFull]
    .filter(Boolean)
    .join(' ')

  const previewStyle = {
    '--activity-list-fade-height': `${ACTIVITY_LIST_FADE_HEIGHT_PX}px`,
  } as CSSProperties

  return (
    <>
      <section
        className={rootClassName}
        aria-label="Recent activity"
        style={isPreview ? previewStyle : undefined}
      >
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

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIconBadge} aria-hidden>
              <ClockIcon className={styles.emptyIcon} strokeWidth={1.5} />
            </span>
            <p className={styles.emptyTitle}>No activity yet</p>
            <p className={styles.emptyBody}>
              Deposits, sends, payment links, and earn moves will show up here.
            </p>
          </div>
        ) : isPreview ? (
          <div className={styles.listViewport}>
            <div
              ref={listScrollRef}
              className={[styles.listScroll, showBottomFade && styles.listScrollFaded]
                .filter(Boolean)
                .join(' ')}
              onScroll={handleListScroll}
            >
              <ActivityListItems
                items={items}
                balanceRevealed={balanceRevealed}
                onItemClick={onItemClick}
              />
            </div>
          </div>
        ) : (
          <ActivityListItems
            items={items}
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
