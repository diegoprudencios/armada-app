import type { ComponentType, SVGProps } from 'react'
import {
  LifebuoyIcon,
  NewspaperIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline'

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>

export type MegaMenuItem = {
  id: string
  title: string
  description: string
  href: string
  external?: boolean
  icon: NavIcon
}

/** Top-level item with a mega-menu panel. */
export type NavMenu = {
  id: string
  label: string
  items: MegaMenuItem[]
}

/** Top-level item that links directly (no dropdown). */
export type NavLink = {
  id: string
  label: string
  href: string
  external?: boolean
}

export type NavItem = NavLink | NavMenu

export function isNavMenu(item: NavItem): item is NavMenu {
  return 'items' in item && Array.isArray(item.items)
}

/**
 * Primary site navigation.
 * Only Resources opens a dropdown; other items are direct links.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'use-cases',
    label: 'Use cases',
    href: '#use-cases',
  },
  {
    id: 'developers',
    label: 'Developers',
    href: '#developers',
  },
  {
    id: 'security',
    label: 'Security',
    href: '#security',
  },
  {
    id: 'protocol',
    label: 'Protocol',
    href: '#protocol',
  },
  {
    id: 'resources',
    label: 'Resources',
    items: [
      {
        id: 'blog',
        title: 'Blog',
        description: 'News and updates from the team',
        href: '#blog',
        icon: NewspaperIcon,
      },
      {
        id: 'brand',
        title: 'Brand',
        description: 'Assets and press kit',
        href: '#brand',
        icon: SwatchIcon,
      },
      {
        id: 'support',
        title: 'Support',
        description: 'Get help from the Armada team',
        href: '#support',
        icon: LifebuoyIcon,
      },
    ],
  },
]
