import type { ComponentType, SVGProps } from 'react'
import {
  BookOpenIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CubeTransparentIcon,
  LifebuoyIcon,
  MapIcon,
  MegaphoneIcon,
  NewspaperIcon,
  PuzzlePieceIcon,
  ScaleIcon,
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

export type NavMenu = {
  id: string
  label: string
  items: MegaMenuItem[]
}

export const NAV_MENUS: NavMenu[] = [
  {
    id: 'arm-token',
    label: 'ARM Token',
    items: [
      {
        id: 'governance',
        title: 'Governance',
        description: 'Vote on how the protocol runs',
        href: 'https://gov.armada.blue',
        external: true,
        icon: ScaleIcon,
      },
      {
        id: 'roadmap',
        title: 'Roadmap',
        description: "See what's shipping next",
        href: '#roadmap',
        icon: MapIcon,
      },
      {
        id: 'dashboard',
        title: 'Dashboard',
        description: 'Protocol metrics and status',
        href: '#dashboard',
        icon: ChartBarIcon,
      },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    items: [
      {
        id: 'discord',
        title: 'Discord',
        description: 'Join the conversation',
        href: '#discord',
        icon: ChatBubbleLeftRightIcon,
      },
      {
        id: 'x',
        title: 'X',
        description: 'Follow product updates',
        href: '#x',
        icon: MegaphoneIcon,
      },
    ],
  },
  {
    id: 'integrate',
    label: 'Integrate Private USDC',
    items: [
      {
        id: 'why-integrate',
        title: 'Why integrate',
        description: "Privacy your users don't have to think about",
        href: '#why-integrate',
        icon: CubeTransparentIcon,
      },
      {
        id: 'docs',
        title: 'Docs',
        description: 'Technical guides and SDKs',
        href: 'https://docs.armada.blue',
        external: true,
        icon: BookOpenIcon,
      },
      {
        id: 'tool',
        title: 'Tool',
        description: 'Integration tooling for builders',
        href: '#tool',
        icon: PuzzlePieceIcon,
      },
    ],
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
