import { useEffect, useId, useRef, useState } from 'react'
import {
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { Button } from '@/components/Button'
import { NavMegaMenu } from '@/components/NavMegaMenu'
import { NAV_ITEMS, isNavMenu } from '@/constants/siteNav'
import { openAppWithWallet } from '@/utils/appNavigation'
import landingLogoWhite from '@/assets/landing-logo-white.png'
import styles from './SiteHeader.module.css'

const SCROLL_THRESHOLD = 48
const SCROLL_DELTA = 6
const OPEN_DELAY_MS = 80
const CLOSE_DELAY_MS = 160

const SOCIAL_LINKS = [
  { label: 'Discord', href: '#discord', icon: 'discord' as const },
  { label: 'X', href: '#x', icon: 'x' as const },
]

function SocialIcon({ name }: { name: 'discord' | 'x' }) {
  if (name === 'discord') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.227-8.451L1.5 2.25h7.08l4.263 5.671L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

export function SiteHeader() {
  /** Fixed solid chrome — only while scrolling up (or mobile menu open). */
  const [floating, setFloating] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null)
  const mobileMenuId = useId()
  const menuIdPrefix = useId()
  const burgerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const lastY = useRef(0)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }

  const scheduleOpen = (id: string) => {
    clearTimers()
    openTimer.current = setTimeout(() => setOpenMenuId(id), OPEN_DELAY_MS)
  }

  const scheduleClose = () => {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpenMenuId(null), CLOSE_DELAY_MS)
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  useEffect(() => {
    lastY.current = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const nearTop = y <= SCROLL_THRESHOLD
      const goingDown = y > lastY.current + SCROLL_DELTA
      const goingUp = y < lastY.current - SCROLL_DELTA

      if (mobileOpen || openMenuId) {
        // Keep chrome available while menus are open
        setFloating(!nearTop)
      } else if (nearTop) {
        // Absolute hero header only — never dock a second bar
        setFloating(false)
      } else if (goingUp) {
        setFloating(true)
      } else if (goingDown) {
        setFloating(false)
      }

      lastY.current = y
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [mobileOpen, openMenuId])

  useEffect(() => {
    if ((mobileOpen || openMenuId) && window.scrollY > SCROLL_THRESHOLD) {
      setFloating(true)
    }
  }, [mobileOpen, openMenuId])

  useEffect(() => {
    if (!openMenuId) return

    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuId(null)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenuId])

  useEffect(() => {
    if (!mobileOpen) return
    const panel = panelRef.current
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled)',
    )
    focusable?.[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        return
      }
      if (e.key !== 'Tab' || !focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const closeMobile = () => {
    setMobileOpen(false)
    setMobileExpandedId(null)
    burgerRef.current?.focus()
  }

  // Fixed solid bar only when floating (scroll-up) or mobile menu needs it.
  // Otherwise stay absolute so nothing flashes in when the hero header leaves.
  const showSolid = floating || mobileOpen
  const headerClass = [
    styles.header,
    showSolid && styles.headerDocked,
    showSolid && styles.headerScrolled,
    mobileOpen && styles.headerMenuOpen,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header className={headerClass}>
        <div className={styles.inner}>
          <a href="/" className={styles.logoLink} aria-label="Armada home">
            {showSolid ? (
              <ArmadaLogo variant="full" className={styles.logo} />
            ) : (
              <img
                className={styles.logoImg}
                src={landingLogoWhite}
                alt=""
                width={132}
                height={32}
                aria-hidden
              />
            )}
          </a>

          <nav
            ref={navRef}
            className={styles.desktopNav}
            aria-label="Primary"
            onMouseLeave={scheduleClose}
          >
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => {
                if (!isNavMenu(item)) {
                  return (
                    <li key={item.id} className={styles.navItem}>
                      <a
                        className={styles.navLink}
                        href={item.href}
                        {...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.label}
                      </a>
                    </li>
                  )
                }

                const panelId = `${menuIdPrefix}-${item.id}`
                const isOpen = openMenuId === item.id
                return (
                  <li
                    key={item.id}
                    className={styles.navItem}
                    onMouseEnter={() => scheduleOpen(item.id)}
                  >
                    <button
                      type="button"
                      className={[styles.navLink, isOpen && styles.navLinkOpen]
                        .filter(Boolean)
                        .join(' ')}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-controls={panelId}
                      onClick={() =>
                        setOpenMenuId((current) => (current === item.id ? null : item.id))
                      }
                      onFocus={() => {
                        clearTimers()
                        setOpenMenuId(item.id)
                      }}
                    >
                      {item.label}
                      <ChevronDownIcon
                        className={[styles.navChevron, isOpen && styles.navChevronOpen]
                          .filter(Boolean)
                          .join(' ')}
                        width={14}
                        height={14}
                        aria-hidden
                      />
                    </button>
                    {isOpen ? (
                      <NavMegaMenu
                        menu={item}
                        id={panelId}
                        onNavigate={() => setOpenMenuId(null)}
                      />
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className={styles.actions}>
            <ul className={styles.socialList} aria-label="Social links">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a className={styles.socialLink} href={social.href} aria-label={social.label}>
                    <SocialIcon name={social.icon} />
                  </a>
                </li>
              ))}
            </ul>
            <Button
              variant="ink"
              size="md"
              label="Armada App"
              showIcon
              icon="arrow-right-micro"
              onClick={openAppWithWallet}
              className={styles.appCta}
            />
          </div>

          <button
            ref={burgerRef}
            type="button"
            className={styles.burger}
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <XMarkIcon width={20} height={20} aria-hidden />
            ) : (
              <Bars3Icon width={20} height={20} aria-hidden />
            )}
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div
          ref={panelRef}
          id={mobileMenuId}
          className={styles.mobilePanel}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <nav aria-label="Primary mobile">
            <ul className={styles.mobileNavList}>
              {NAV_ITEMS.map((item) => {
                if (!isNavMenu(item)) {
                  return (
                    <li key={item.id} className={styles.mobileNavItem}>
                      <a
                        className={styles.mobileNavLink}
                        href={item.href}
                        onClick={closeMobile}
                        {...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.label}
                      </a>
                    </li>
                  )
                }

                const expanded = mobileExpandedId === item.id
                const sectionId = `${mobileMenuId}-${item.id}`
                return (
                  <li key={item.id} className={styles.mobileNavItem}>
                    <button
                      type="button"
                      className={styles.mobileNavLink}
                      aria-expanded={expanded}
                      aria-controls={sectionId}
                      onClick={() =>
                        setMobileExpandedId((current) =>
                          current === item.id ? null : item.id,
                        )
                      }
                    >
                      {item.label}
                      <ChevronDownIcon
                        className={[styles.navChevron, expanded && styles.navChevronOpen]
                          .filter(Boolean)
                          .join(' ')}
                        width={16}
                        height={16}
                        aria-hidden
                      />
                    </button>
                    {expanded ? (
                      <div id={sectionId} className={styles.mobileMegaWrap}>
                        <NavMegaMenu
                          menu={item}
                          id={`${sectionId}-panel`}
                          onNavigate={closeMobile}
                        />
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </nav>
          <ul className={styles.mobileSocialList} aria-label="Social links">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                <a
                  className={styles.socialLink}
                  href={social.href}
                  aria-label={social.label}
                  onClick={closeMobile}
                >
                  <SocialIcon name={social.icon} />
                </a>
              </li>
            ))}
          </ul>
          <Button
            variant="ink"
            size="lg"
            label="Armada App"
            showIcon
            icon="arrow-right-micro"
            onClick={() => {
              closeMobile()
              openAppWithWallet()
            }}
            className={styles.mobileCta}
          />
        </div>
      ) : null}
    </>
  )
}
