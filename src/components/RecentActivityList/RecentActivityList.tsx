import type { ComponentType, SVGProps } from 'react'
import {
  ArrowUpIcon,
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { BalanceScrambleValue } from '@/components/BalanceScrambleValue'
import type { DashboardActivityItem, DashboardActivityKind } from '@/constants/dashboardActivity'
import { formatUsdcAmount } from '@/utils/format'
import { formatTimeAgo } from '@/utils/formatTimeAgo'
import usdcAmount from '@/styles/usdcAmount.module.css'
import styles from './RecentActivityList.module.css'

const ACTIVITY_ICONS: Record<
  DashboardActivityKind,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  send: ArrowUpIcon,
  deposit: PlusIcon,
  earn: ChartBarIcon,
}

function formatSignedAmount(amount: number): string {
  const absolute = formatUsdcAmount(Math.abs(amount))
  if (amount > 0) return `+${absolute}`
  if (amount < 0) return `-${absolute}`
  return absolute
}

export interface RecentActivityListProps {
  items: readonly DashboardActivityItem[]
  balanceRevealed?: boolean
  onItemClick?: (item: DashboardActivityItem) => void
}

export function RecentActivityList({
  items,
  balanceRevealed = true,
  onItemClick,
}: RecentActivityListProps) {
  return (
    <section className={styles.root} aria-label="Recent activity">
      <h2 className={styles.heading}>Recent activity</h2>
      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIconBadge} aria-hidden>
            <ClockIcon className={styles.emptyIcon} strokeWidth={1.5} />
          </span>
          <p className={styles.emptyTitle}>No activity yet</p>
          <p className={styles.emptyBody}>
            Deposits, sends, and earn moves will show up here.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => {
            const Icon = ACTIVITY_ICONS[item.kind]
            const signedAmount = formatSignedAmount(item.amount)
            const amountLabel = `${signedAmount} USDC`
            const amountTone =
              balanceRevealed && item.amount > 0
                ? styles.amountPositive
                : balanceRevealed && item.amount < 0
                  ? styles.amountNegative
                  : ''

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
                    <span className={styles.time}>{formatTimeAgo(item.occurredAt)}</span>
                  </div>
                  <span
                    className={[styles.amount, usdcAmount.font, amountTone].filter(Boolean).join(' ')}
                    aria-label={balanceRevealed ? amountLabel : 'Amount hidden'}
                  >
                    <BalanceScrambleValue value={signedAmount} revealed={balanceRevealed} />
                    <span className={styles.amountSuffix}> USDC</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
