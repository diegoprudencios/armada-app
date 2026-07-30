import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import type { MegaMenuItem, NavMenu } from '@/constants/siteNav'
import styles from './NavMegaMenu.module.css'

const ICON_PX = 22

type NavMegaMenuProps = {
  menu: NavMenu
  id: string
  onNavigate?: () => void
}

function MenuItemLink({
  item,
  onNavigate,
}: {
  item: MegaMenuItem
  onNavigate?: () => void
}) {
  const Icon = item.icon
  return (
    <a
      className={styles.item}
      href={item.href}
      onClick={onNavigate}
      {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className={styles.iconWrap} aria-hidden>
        <Icon width={ICON_PX} height={ICON_PX} className={styles.icon} />
      </span>
      <span className={styles.copy}>
        <span className={styles.itemTitle}>
          {item.title}
          {item.external ? (
            <ArrowUpRightIcon width={14} height={14} className={styles.externalIcon} aria-hidden />
          ) : null}
        </span>
        <span className={styles.itemDesc}>{item.description}</span>
      </span>
    </a>
  )
}

export function NavMegaMenu({ menu, id, onNavigate }: NavMegaMenuProps) {
  return (
    <div id={id} className={styles.panel} role="region" aria-label={`${menu.label} menu`}>
      <ul className={styles.list}>
        {menu.items.map((item) => (
          <li key={item.id}>
            <MenuItemLink item={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  )
}
