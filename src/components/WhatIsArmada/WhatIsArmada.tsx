import { lazy, Suspense } from 'react'
import { Button } from '@/components/Button'
import type { ButtonVariant } from '@/components/Button'
import { FleetFogCompare } from './FleetFogCompare'
import { ComplianceToggleStack } from './ComplianceToggleStack'
import { FoundationsCubeGrid } from './FoundationsCubeGrid'
import { BeyondCaptureGuard } from './BeyondCaptureGuard'
import { UsdcLoopIntro } from './UsdcLoopIntro'
import styles from './WhatIsArmada.module.css'

/**
 * Sphere diagram variant on the capital-in-motion panel:
 * - 'default' — continuous USDC traveler (PrivacySphere)
 * - 'story' — dual-layer rim sync: sharp outside / blurred inside (PrivacySphereStory)
 *
 * Flip this flag, then hard-refresh — React.lazy + HMR can keep the old chunk mounted.
 */
const PRIVACY_SPHERE_VARIANT: 'default' | 'story' = 'story'

/**
 * Privacy intro layout:
 * - 'loop' — sticky concentric rings + wash fade + copy
 * - 'centered' — title + body/CTA above, full-width fog banner below
 * - 'split' — full-bleed 50/50: copy left | fog right
 */
const INTRO_LAYOUT: 'loop' | 'centered' | 'split' = 'centered'

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
  title: readonly [string] | readonly [string, string]
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
    body: 'Give authorized parties access to the records they need without making financial activity visible to the entire market.',
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
    title: ['Beyond capture'] as const,
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

function IntroCentered() {
  return (
    <div className={styles.intro} id="what-is-armada">
      <div className={`armada-site-stack ${styles.introText}`}>
        <h2 id="integrators-heading" className={`armada-text-title ${styles.introTitle}`}>
          {`${INTRO.title[0]} ${INTRO.title[1]}`}
        </h2>
        <p className={`armada-text-body ${styles.introBody}`}>{INTRO.body}</p>
        <CtaRow ctas={INTRO.ctas} align="center" />
      </div>

      <FleetFogCompare className={styles.fog} layout="banner" />
    </div>
  )
}

function IntroSplit() {
  return (
    <div className={styles.introSplit} id="what-is-armada">
      <div className={`armada-site-stack ${styles.introSplitContent}`}>
        <h2
          id="integrators-heading"
          className={`armada-text-title ${styles.introSplitTitle}`}
        >
          <span className={styles.titleLine}>{INTRO.title[0]}</span>
          <span className={styles.titleLine}>{INTRO.title[1]}</span>
        </h2>
        <p className={`armada-text-body ${styles.introSplitBody}`}>{INTRO.body}</p>
        <CtaRow ctas={INTRO.ctas} align="start" />
      </div>
      <div className={styles.introSplitMedia}>
        <FleetFogCompare className={styles.fogSplit} layout="fill" />
      </div>
    </div>
  )
}

export function WhatIsArmada() {
  const isLoop = INTRO_LAYOUT === 'loop'
  const isSplit = INTRO_LAYOUT === 'split'
  const isCentered = INTRO_LAYOUT === 'centered'

  return (
    <section
      className={[
        styles.section,
        isSplit ? styles.sectionSplit : '',
        isLoop ? styles.sectionLoop : '',
        isCentered ? styles.sectionIntroStack : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="What is Armada"
    >
      {isLoop ? <UsdcLoopIntro content={INTRO} /> : null}
      {isSplit ? <IntroSplit /> : null}
      {INTRO_LAYOUT === 'centered' ? <IntroCentered /> : null}

      <div className={styles.features}>
        <div className={styles.stack}>
          {FEATURES.map((block) => {
            const isCapital = block.id === 'capital-in-motion'
            const isCompliance = block.id === 'compliance'
            const isBeyondCapture = block.id === 'beyond-capture'
            const isFoundations = block.id === 'foundations'
            const isPanelSplit =
              isCapital || isCompliance || isBeyondCapture || isFoundations
            return (
              <article
                key={block.id}
                id={block.id}
                className={[
                  styles.panel,
                  isPanelSplit ? styles.panelSplit : '',
                  isCompliance || isFoundations ? styles.panelSplitDeepLeft : '',
                  isFoundations ? styles.panelCrop : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-labelledby={`${block.id}-heading`}
              >
                <div className={`armada-site-stack ${styles.panelContent}`}>
                  <h2
                    id={`${block.id}-heading`}
                    className={`armada-text-title ${styles.panelTitle}`}
                  >
                    {block.title.map((line) => (
                      <span key={line} className={styles.titleLine}>
                        {line}
                      </span>
                    ))}
                  </h2>
                  <p className={`armada-text-body ${styles.panelBody}`}>{block.body}</p>
                  <CtaRow ctas={block.ctas} align="start" />
                </div>
                {isCapital ? (
                  <div className={styles.panelDiagram}>
                    <Suspense key={PRIVACY_SPHERE_VARIANT} fallback={null}>
                      <PrivacySphereViz />
                    </Suspense>
                  </div>
                ) : null}
                {isCompliance ? (
                  <div className={`${styles.panelDiagram} ${styles.panelDiagramFill}`}>
                    <ComplianceToggleStack />
                  </div>
                ) : null}
                {isBeyondCapture ? (
                  <div className={`${styles.panelDiagram} ${styles.panelDiagramFill}`}>
                    <BeyondCaptureGuard />
                  </div>
                ) : null}
                {isFoundations ? (
                  <div className={`${styles.panelDiagram} ${styles.panelDiagramCrop}`}>
                    <FoundationsCubeGrid />
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
