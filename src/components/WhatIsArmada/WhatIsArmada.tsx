import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/Button'
import type { ButtonVariant } from '@/components/Button'
import styles from './WhatIsArmada.module.css'

type Cta =
  | {
      kind: 'button'
      label: string
      href: string
      external?: boolean
      variant: Extract<ButtonVariant, 'primary' | 'secondary'>
    }
  | {
      kind: 'link'
      label: string
      href: string
      external?: boolean
    }

type Block = {
  id: string
  /** Two lines — rendered with a forced break. */
  title: [string, string]
  body: string
  ctas?: Cta[]
}

const BLOCKS: Block[] = [
  {
    id: 'integrators',
    title: ["Privacy your users don't have to", 'think about'],
    body: "Add shielded USDC rails to your product through Armada's SDK, APIs, and compliance tooling. Built for platforms that manage, deploy, and move private capital on-chain.",
    ctas: [
      {
        kind: 'button',
        label: 'Integrate and testing',
        href: 'https://docs.armada.blue',
        external: true,
        variant: 'primary',
      },
    ],
  },
  {
    id: 'capital-in-motion',
    title: ['Protecting capital', 'in motion'],
    body: 'Shield your relationships: balances, counterparties, allocation activity, and transaction history while continuing to operate with USDC.',
  },
  {
    id: 'compliance',
    title: ['Compliance without', 'intermediaries'],
    body: 'Give authorized parties access to the records they need without making financial activity visible to the entire market.',
  },
  {
    id: 'beyond-capture',
    title: ['Built beyond', 'capture'],
    body: "Like Ethereum, Armada's shielded pool is neutral infrastructure: no company or governing entity can take control of it.",
  },
  {
    id: 'foundations',
    title: ['Built on battle-tested', 'foundations'],
    body: 'Armada builds on established decentralized architecture and cryptographic primitives refined through years of real-world use, adversarial pressure, and continuous iteration.',
    ctas: [
      {
        kind: 'button',
        label: 'Explore the architecture',
        href: '#architecture',
        variant: 'primary',
      },
      {
        kind: 'button',
        label: 'Review security',
        href: '#security',
        variant: 'secondary',
      },
    ],
  },
]

export function WhatIsArmada() {
  return (
    <section className={styles.section} aria-label="What is Armada">
      {BLOCKS.map((block, index) => (
        <article
          key={block.id}
          id={index === 0 ? 'what-is-armada' : block.id}
          className={styles.block}
          aria-labelledby={`${block.id}-heading`}
        >
          <div className={styles.panel}>
            <div className={styles.content}>
              <h2 id={`${block.id}-heading`} className={styles.title}>
                {block.title[0]}
                <br />
                {block.title[1]}
              </h2>
              <p className={styles.body}>{block.body}</p>
              {block.ctas && block.ctas.length > 0 ? (
                <div className={styles.ctaRow}>
                  {block.ctas.map((cta) =>
                    cta.kind === 'button' ? (
                      <Button
                        key={cta.label}
                        variant={cta.variant}
                        size="lg"
                        label={cta.label}
                        showIcon={false}
                        href={cta.href}
                        {...(cta.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      />
                    ) : (
                      <a
                        key={cta.label}
                        className={styles.cta}
                        href={cta.href}
                        {...(cta.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        <span>{cta.label}</span>
                        <ArrowRightIcon width={16} height={16} aria-hidden />
                      </a>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
