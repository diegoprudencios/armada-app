import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react'
import { Button } from '@/components/Button'
import type { ButtonVariant } from '@/components/Button'
import { RevealStack } from '@/components/ScrollReveal'
import {
  INTRO_HOLD_BEFORE_FOG_SVH,
  INTRO_UNDER_HERO_MARGIN,
} from '@/constants/homepageHandoff'
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
  title: ['Privacy your users', "don't have to think about"] as [string, string],
  body: 'Add shielded USDC to your product with the SDK, APIs, and compliance tooling.',
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

/** Sticky under-hero handoff is desktop-only; mobile is a normal scroll section. */
function useDesktopHandoff(enabled: boolean) {
  const [active, setActive] = useState(() =>
    enabled && typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 768px)').matches
      : false,
  )

  useEffect(() => {
    if (!enabled) {
      setActive(false)
      return
    }
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setActive(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [enabled])

  return active
}

function IntroCentered({ underHero = false }: { underHero?: boolean }) {
  const pinHandoff = useDesktopHandoff(underHero)

  const copyBlock = (
    <>
      <h2 id="integrators-heading" className={`armada-text-title ${styles.introTitle}`}>
        <span className={styles.titleLine}>{INTRO.title[0]}</span>
        <span className={styles.titleLine}>{INTRO.title[1]}</span>
      </h2>
      <p className={`armada-text-body ${styles.introBody}`}>{INTRO.body}</p>
      <CtaRow ctas={INTRO.ctas} align="center" />
    </>
  )

  return (
    <div
      className={[styles.intro, pinHandoff ? styles.introUnderHero : '']
        .filter(Boolean)
        .join(' ')}
      id="what-is-armada"
      style={
        pinHandoff
          ? ({
              ['--intro-under-hero-margin' as string]: INTRO_UNDER_HERO_MARGIN,
              ['--intro-hold-svh' as string]: `${INTRO_HOLD_BEFORE_FOG_SVH}svh`,
            } as CSSProperties)
          : undefined
      }
    >
      {pinHandoff ? (
        <div className={styles.introLead}>
          <div
            className={`armada-site-stack ${styles.introText} ${styles.introTextHandoff}`}
          >
            {copyBlock}
          </div>
        </div>
      ) : (
        <RevealStack motion="fade" className={`armada-site-stack ${styles.introText}`}>
          {copyBlock}
        </RevealStack>
      )}

      {pinHandoff ? <div className={styles.introHold} aria-hidden /> : null}

      <div
        className={[styles.fogWrap, pinHandoff ? styles.fogWrapCover : '']
          .filter(Boolean)
          .join(' ')}
      >
        <FleetFogCompare
          className={styles.fog}
          layout={pinHandoff ? 'cover' : 'card'}
        />
      </div>
    </div>
  )
}

function IntroSplit() {
  return (
    <div className={styles.introSplit} id="what-is-armada">
      <RevealStack className={`armada-site-stack ${styles.introSplitContent}`}>
        <h2
          id="integrators-heading"
          className={`armada-text-title ${styles.introSplitTitle}`}
        >
          <span className={styles.titleLine}>{INTRO.title[0]}</span>
          <span className={styles.titleLine}>{INTRO.title[1]}</span>
        </h2>
        <p className={`armada-text-body ${styles.introSplitBody}`}>{INTRO.body}</p>
        <CtaRow ctas={INTRO.ctas} align="start" />
      </RevealStack>
      <div className={styles.introSplitMedia}>
        <FleetFogCompare className={styles.fogSplit} layout="fill" />
      </div>
    </div>
  )
}

export type WhatIsArmadaFeaturesLayout = 'stack' | 'grid' | 'bento'

export interface WhatIsArmadaProps {
  /**
   * Feature band layout experiment:
   * - `stack` — current full-width stacked splits (default /homepage)
   * - `grid` — same splits with blueprint frame lines (/homepage3)
   * - `bento` — privacy + features as a varied bento grid (/homepage4)
   */
  featuresLayout?: WhatIsArmadaFeaturesLayout
  /**
   * Pull the privacy intro under the hero pin so copy fades in centered
   * as the hero dissolves to amber (`/homepage` + heroScrollExit).
   */
  introUnderHero?: boolean
}

function FeatureCopy({
  block,
  headingId,
  contentClassName,
  titleClassName,
  bodyClassName,
}: {
  block: Block
  headingId: string
  contentClassName: string
  titleClassName?: string
  bodyClassName?: string
}) {
  return (
    <RevealStack className={`armada-site-stack ${contentClassName}`}>
      <h2
        id={headingId}
        className={`armada-text-title ${titleClassName ?? styles.panelTitle}`}
      >
        {block.title.map((line) => (
          <span key={line} className={styles.titleLine}>
            {line}
          </span>
        ))}
      </h2>
      <p className={`armada-text-body ${bodyClassName ?? styles.panelBody}`}>{block.body}</p>
      <CtaRow ctas={block.ctas} align="start" />
    </RevealStack>
  )
}

function FeatureDiagram({ id }: { id: string }) {
  if (id === 'capital-in-motion') {
    return (
      <div className={styles.panelDiagram}>
        <Suspense key={PRIVACY_SPHERE_VARIANT} fallback={null}>
          <PrivacySphereViz />
        </Suspense>
      </div>
    )
  }
  if (id === 'compliance') {
    return (
      <div className={`${styles.panelDiagram} ${styles.panelDiagramFill}`}>
        <ComplianceToggleStack />
      </div>
    )
  }
  if (id === 'beyond-capture') {
    return (
      <div className={`${styles.panelDiagram} ${styles.panelDiagramFill}`}>
        <BeyondCaptureGuard />
      </div>
    )
  }
  if (id === 'foundations') {
    return (
      <div className={`${styles.panelDiagram} ${styles.panelDiagramCrop}`}>
        <FoundationsCubeGrid />
      </div>
    )
  }
  return null
}

/** Homepage4 — privacy + features as one varied bento composition. */
function BentoBand() {
  const capital = FEATURES[0]
  const compliance = FEATURES[1]
  const beyond = FEATURES[2]
  const foundations = FEATURES[3]

  return (
    <div className={`${styles.features} ${styles.featuresBento}`}>
      <div className={`${styles.stack} ${styles.stackBento}`}>
        {/* Privacy — wide: copy | fog */}
        <article
          className={`${styles.panel} ${styles.panelBento} ${styles.bentoPrivacy}`}
          id="what-is-armada"
          aria-labelledby="integrators-heading"
        >
          <RevealStack
            className={`armada-site-stack ${styles.bentoPrivacyCopy}`}
          >
            <h2
              id="integrators-heading"
              className={`armada-text-title ${styles.panelTitle}`}
            >
              {`${INTRO.title[0]} ${INTRO.title[1]}`}
            </h2>
            <p className={`armada-text-body ${styles.panelBody}`}>{INTRO.body}</p>
            <CtaRow ctas={INTRO.ctas} align="start" />
          </RevealStack>
          <div className={styles.bentoPrivacyMedia}>
            <FleetFogCompare className={styles.fogSplit} layout="fill" />
          </div>
        </article>

        {/* Capital — all deep, horizontal split */}
        <article
          className={[
            styles.panel,
            styles.panelSplit,
            styles.panelBento,
            styles.panelDeep,
            styles.bentoCapital,
          ].join(' ')}
          id={capital.id}
          aria-labelledby={`${capital.id}-heading`}
        >
          <FeatureCopy
            block={capital}
            headingId={`${capital.id}-heading`}
            contentClassName={`${styles.panelContent} ${styles.panelContentDeep}`}
            titleClassName={`${styles.panelTitle} ${styles.panelTitleDeep}`}
            bodyClassName={`${styles.panelBody} ${styles.panelBodyDeep}`}
          />
          <FeatureDiagram id={capital.id} />
        </article>

        {/* Compliance — vertical: diagram above, copy below */}
        <article
          className={[
            styles.panel,
            styles.panelBento,
            styles.bentoCompliance,
          ].join(' ')}
          id={compliance.id}
          aria-labelledby={`${compliance.id}-heading`}
        >
          <FeatureDiagram id={compliance.id} />
          <FeatureCopy
            block={compliance}
            headingId={`${compliance.id}-heading`}
            contentClassName={styles.panelContent}
          />
        </article>

        {/* Beyond — cream card (diagram + dark copy) */}
        <article
          className={[
            styles.panel,
            styles.panelBento,
            styles.bentoBeyond,
          ].join(' ')}
          id={beyond.id}
          aria-labelledby={`${beyond.id}-heading`}
        >
          <FeatureDiagram id={beyond.id} />
          <FeatureCopy
            block={beyond}
            headingId={`${beyond.id}-heading`}
            contentClassName={styles.panelContent}
          />
        </article>

        {/* Foundations — horizontal, deep left */}
        <article
          className={[
            styles.panel,
            styles.panelSplit,
            styles.panelSplitDeepLeft,
            styles.panelCrop,
            styles.panelBento,
            styles.bentoFoundations,
          ].join(' ')}
          id={foundations.id}
          aria-labelledby={`${foundations.id}-heading`}
        >
          <FeatureCopy
            block={foundations}
            headingId={`${foundations.id}-heading`}
            contentClassName={styles.panelContent}
          />
          <FeatureDiagram id={foundations.id} />
        </article>
      </div>
    </div>
  )
}

export function WhatIsArmada({
  featuresLayout = 'stack',
  introUnderHero = false,
}: WhatIsArmadaProps) {
  const isLoop = INTRO_LAYOUT === 'loop'
  const isSplit = INTRO_LAYOUT === 'split'
  const isCentered = INTRO_LAYOUT === 'centered'
  const isGrid = featuresLayout === 'grid'
  const isBento = featuresLayout === 'bento'

  if (isBento) {
    return (
      <section
        className={`${styles.section} ${styles.sectionIntroStack} ${styles.sectionBento}`}
        aria-label="What is Armada"
      >
        <BentoBand />
      </section>
    )
  }

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
      {isCentered ? <IntroCentered underHero={introUnderHero} /> : null}

      <div
        className={[styles.features, isGrid ? styles.featuresGrid : '']
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={[styles.stack, isGrid ? styles.stackGrid : '']
            .filter(Boolean)
            .join(' ')}
        >
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
                  isGrid ? styles.panelGrid : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-labelledby={`${block.id}-heading`}
              >
                {isGrid ? (
                  <>
                    <span className={styles.gridLineH} data-edge="top" aria-hidden />
                    <span className={styles.gridLineH} data-edge="bottom" aria-hidden />
                    {isPanelSplit ? (
                      <span className={styles.gridMid} aria-hidden />
                    ) : null}
                  </>
                ) : null}
                <FeatureCopy
                  block={block}
                  headingId={`${block.id}-heading`}
                  contentClassName={styles.panelContent}
                />
                <FeatureDiagram id={block.id} />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
