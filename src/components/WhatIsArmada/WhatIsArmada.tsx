import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/Button'
import { openAppWithWallet } from '@/utils/appNavigation'
import styles from './WhatIsArmada.module.css'

type Block = {
  id: string
  /** Persona label — used as accessible name, not shown visually. */
  eyebrow: string
  title: string
  body: string
  cta: {
    label: string
    href?: string
    onClick?: () => void
  }
}

const BLOCKS: Block[] = [
  {
    id: 'owners',
    eyebrow: 'For those who govern it',
    title: 'Own the rails, not just the token',
    body: 'Voting power tracks real commitment. If the protocol misses its marks, the wind-down returns treasury funds. No rug, no discretion.',
    cta: { label: 'Governance interface', href: 'https://gov.armada.blue' },
  },
  {
    id: 'integrators',
    eyebrow: 'For those who build on it',
    title: "Privacy your users don't have to think about",
    body: 'Plug shielded USDC rails into your product. Docs, SDKs, and support — built for treasury tools, payroll, and payment apps.',
    cta: { label: 'Read the docs', href: 'https://docs.armada.blue' },
  },
  {
    id: 'users',
    eyebrow: 'For those who use it',
    title: 'Move USDC without the audience',
    body: "Deposit, send, and hold USDC privately. You're either in the shielded pool or you're not.",
    cta: { label: 'Open Armada App', onClick: openAppWithWallet },
  },
]

export function WhatIsArmada() {
  return (
    <section className={styles.section} aria-label="What is Armada">
      {BLOCKS.map((block, index) => (
        <article
          key={block.id}
          id={index === 0 ? 'what-is-armada' : undefined}
          className={styles.block}
          aria-label={block.eyebrow}
        >
          <div className={styles.panel}>
            <div className={styles.content}>
              <h2 className={styles.title}>{block.title}</h2>
              <p className={styles.body}>{block.body}</p>
              {block.cta.href ? (
                <a
                  className={styles.cta}
                  href={block.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{block.cta.label}</span>
                  <ArrowRightIcon width={16} height={16} aria-hidden />
                </a>
              ) : (
                <Button
                  variant="ghost"
                  size="md"
                  label={block.cta.label}
                  showIcon
                  icon="arrow-right"
                  onClick={block.cta.onClick}
                  className={styles.ctaButton}
                />
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
