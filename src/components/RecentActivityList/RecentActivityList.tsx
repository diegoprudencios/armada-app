import type { ComponentType, SVGProps } from 'react'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import {
  DEMO_RECENT_ACTIVITY,
  type DashboardActivityItem,
  type DashboardActivityKind,
} from '@/constants/dashboardActivity'
import { formatUsdcAmount } from '@/utils/format'
import usdcAmount from '@/styles/usdcAmount.module.css'
import styles from './RecentActivityList.module.css'

const ACTIVITY_ICONS: Record<
  DashboardActivityKind,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  send: ArrowUpIcon,
  deposit: PlusIcon,
  earn: ChartBarIcon,
  receive: ArrowDownIcon,
}

function formatSignedUsdc(amount: number): string {
  const absolute = formatUsdcAmount(Math.abs(amount))
  if (amount > 0) return `+${absolute} USDC`
  if (amount < 0) return `-${absolute} USDC`
  return `${absolute} USDC`
}

export interface RecentActivityListProps {
  items?: readonly DashboardActivityItem[]
}

export function RecentActivityList({ items = DEMO_RECENT_ACTIVITY }: RecentActivityListProps) {
  if (items.length === 0) return null

  return (
    <section className={styles.root} aria-label="Recent activity">
      <h2 className={styles.heading}>Recent activity</h2>
      <ul className={styles.list}>
        {items.map((item) => {
          const Icon = ACTIVITY_ICONS[item.kind]
          const amountLabel = formatSignedUsdc(item.amount)
          const amountTone =
            item.amount > 0 ? styles.amountPositive : item.amount < 0 ? styles.amountNegative : ''

          return (
            <li key={item.id}>
              <div className={styles.item}>
                <span className={styles.iconBadge} aria-hidden>
                  <Icon className={styles.icon} strokeWidth={1.5} />
                </span>
                <div className={styles.copy}>
                  <span className={styles.label}>{item.label}</span>
                  <span className={styles.time}>{item.timeAgo}</span>
                </div>
                <span
                  className={[styles.amount, usdcAmount.font, amountTone].filter(Boolean).join(' ')}
                >
                  {amountLabel}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
