import { lazy, Suspense } from 'react'
import { Button } from '@/components/Button'
import type { ButtonVariant } from '@/components/Button'
import { FleetFogCompare } from './FleetFogCompare'
import styles from './WhatIsArmada.module.css'

/**
 * Sphere diagram variant on the capital-in-motion panel:
 * - 'default' — continuous USDC traveler (PrivacySphere)
 * - 'story' — dual-layer rim sync: sharp outside / blurred inside (PrivacySphereStory)
 *
 * Flip this flag, then hard-refresh — React.lazy + HMR can keep the old chunk mounted.
 */
const PRIVACY_SPHERE_VARIANT: 'default' | 'story' = 'story'

const PrivacySphereDefault = lazy(() =>
  import('@/components/PrivacySphere').then((module) => ({ default: module.PrivacySphere })),
)
const PrivacySphereStoryLazy = lazy(() =>
  import('@/components/PrivacySphere').then((module) => ({ default: module.PrivacySphereStory })),
)
const PrivacySphereViz =
  PRIVACY_SPHERE_VARIANT === 'story' ? PrivacySphereStoryLazy : PrivacySphereDefault

type Cta = {
  label: string
  href: string
  external?: boolean
  variant: Extract<ButtonVariant, 'primary' | 'secondary' | 'ghost'>
}

type Block = {
  id: string
  title: [string, string]
  body: string
  ctas: Cta[]
}

const INTRO = {
  id: 'integrators',
  title: ["Privacy your users don't", 'have to think about'] as [string, string],
  body: "Add shielded USDC rails to your product through Armada's SDK, APIs, and compliance tooling. Built for platforms that manage, deploy, and move private capital on-chain.",
  ctas: [
    {
      label: 'Integrate and test',
      href: 'https://docs.armada.blue',
      external: true,
      variant: 'primary' as const,
    },
  ],
}

const FEATURES: Block[] = [
  {
    id: 'capital-in-motion',
    title: ['Protecting capital', 'in motion'],
    body: 'Shield your relationships: balances, counterparties, allocation activity, and transaction history while continuing to operate with USDC.',
    ctas: [
      {
        label: 'Integrate and test',
        href: 'https://docs.armada.blue',
        external: true,
        variant: 'primary',
      },
    ],
  },
  {
    id: 'compliance',
    title: ['Compliance without', 'intermediaries'],
    body: "Support policy controls, selective disclosure, transaction records, and reporting workflows through Armada's compliance tooling.",
    ctas: [
      {
        label: 'Integrate and test',
        href: 'https://docs.armada.blue',
        external: true,
        variant: 'primary',
      },
    ],
  },
  {
    id: 'beyond-capture',
    title: ['Built beyond', 'capture'],
    body: "Like Ethereum, Armada's shielded pool is neutral infrastructure: no company or governing entity can take control of it.",
    ctas: [
      {
        label: 'Integrate and test',
        href: 'https://docs.armada.blue',
        external: true,
        variant: 'primary',
      },
    ],
  },
  {
    id: 'foundations',
    title: ['Built on battle-tested', 'foundations'],
    body: 'Armada builds on established decentralized architecture and cryptographic primitives refined through years of real-world use, adversarial pressure, and continuous iteration.',
    ctas: [
      {
        label: 'Explore the architecture',
        href: '#architecture',
        variant: 'primary',
      },
      {
        label: 'Review security',
        href: '#security',
        variant: 'ghost',
      },
    ],
  },
]

function CtaRow({ ctas, align }: { ctas: Cta[]; align: 'center' | 'start' }) {
  return (
    <div className={align === 'center' ? styles.ctaRowCenter : styles.ctaRowStart}>
      {ctas.map((cta) => (
        <Button
          key={cta.label}
          variant={cta.variant === 'ghost' ? 'ghost' : cta.variant}
          size="lg"
          label={cta.label}
          showIcon={false}
          href={cta.href}
          className={cta.variant === 'ghost' ? styles.ghostCta : undefined}
          {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        />
      ))}
    </div>
  )
}

export function WhatIsArmada() {
  return (
    <section className={styles.section} aria-label="What is Armada">
      <div className={styles.intro} id="what-is-armada">
        <h2 id="integrators-heading" className={styles.introTitle}>
          <span className={styles.titleLine}>{INTRO.title[0]}</span>
          <span className={styles.titleLine}>{INTRO.title[1]}</span>
        </h2>

        <FleetFogCompare className={styles.fog} />

        <div className={styles.introCopy}>
          <p className={styles.introBody}>{INTRO.body}</p>
          <CtaRow ctas={INTRO.ctas} align="center" />
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.stack}>
          {FEATURES.map((block) => {
            const isCapital = block.id === 'capital-in-motion'
            return (
              <article
                key={block.id}
                id={block.id}
                className={isCapital ? `${styles.panel} ${styles.panelSplit}` : styles.panel}
                aria-labelledby={`${block.id}-heading`}
              >
                <div className={styles.panelContent}>
                  <h2 id={`${block.id}-heading`} className={styles.panelTitle}>
                    <span className={styles.titleLine}>{block.title[0]}</span>
                    <span className={styles.titleLine}>{block.title[1]}</span>
                  </h2>
                  <p className={styles.panelBody}>{block.body}</p>
                  <CtaRow ctas={block.ctas} align="start" />
                </div>
                {isCapital ? (
                  <div className={styles.panelDiagram}>
                    <Suspense key={PRIVACY_SPHERE_VARIANT} fallback={null}>
                      <PrivacySphereViz />
                    </Suspense>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
