import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Button } from '@/components/Button'
import type { ButtonVariant } from '@/components/Button'
import { RevealStack } from '@/components/ScrollReveal'
import {
  COPY_EXIT_CARD,
  INTRO_CARD_OVERLAP,
  INTRO_EXIT_PIN_HEIGHT,
  INTRO_UNDER_HERO_MARGIN,
  clamp01,
  remap01,
  smoothstep,
} from '@/constants/homepageHandoff'
import { useDesktopHandoff } from '@/hooks/useDesktopHandoff'
import { ComplianceToggleStack } from './ComplianceToggleStack'
import { FoundationsCubeGrid } from './FoundationsCubeGrid'
import { BeyondCaptureGuard } from './BeyondCaptureGuard'
import styles from './HomepageFeatures.module.css'

const PrivacySphereViz = lazy(() =>
  import('@/components/PrivacySphere').then((module) => ({ default: module.PrivacySphereStory })),
)

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
  body: 'Add shielded USDC to your product.',
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
    body: 'Shield your relationships while continuing to operate with USDC.',
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
    body: 'Only you give authorized parties access to the records they need.',
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

function IntroCentered({ underHero = false }: { underHero?: boolean }) {
  const pinHandoff = useDesktopHandoff(underHero)
  const copyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pinHandoff) {
      document.documentElement.style.removeProperty('--privacy-exit')
      return
    }

    const root = document.documentElement
    let frame = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const scrub = () => {
      frame = 0
      const copy = copyRef.current

      if (reducedMotion.matches) {
        root.style.setProperty('--privacy-exit', '0')
        if (copy) {
          copy.style.opacity = '1'
          copy.style.removeProperty('pointer-events')
        }
        return
      }

      let exit = 0
      const card = document.querySelector<HTMLElement>('[data-privacy-exit-card]')
      if (card) {
        const vh = window.innerHeight
        const top = card.getBoundingClientRect().top
        // Card top moves downward (startTop → endTop). remap01 interpolates both directions.
        exit = smoothstep(
          remap01(top, vh * COPY_EXIT_CARD.startTop, vh * COPY_EXIT_CARD.endTop),
        )
      }
      root.style.setProperty('--privacy-exit', exit.toFixed(4))

      if (copy) {
        const copyIn =
          parseFloat(root.style.getPropertyValue('--privacy-copy')) || 0
        const copyOpacity = copyIn * (1 - exit)
        copy.style.opacity = copyOpacity.toFixed(4)
        if (copyOpacity < 0.05) copy.style.pointerEvents = 'none'
        else copy.style.removeProperty('pointer-events')
      }
    }

    const requestScrub = () => {
      if (frame) return
      frame = requestAnimationFrame(scrub)
    }

    window.addEventListener('scroll', requestScrub, { passive: true })
    window.addEventListener('resize', requestScrub)
    window.addEventListener('scrollend', requestScrub)
    requestScrub()
    reducedMotion.addEventListener('change', requestScrub)

    return () => {
      window.removeEventListener('scroll', requestScrub)
      window.removeEventListener('resize', requestScrub)
      window.removeEventListener('scrollend', requestScrub)
      reducedMotion.removeEventListener('change', requestScrub)
      if (frame) cancelAnimationFrame(frame)
      root.style.removeProperty('--privacy-exit')
      if (copyRef.current) {
        copyRef.current.style.removeProperty('opacity')
        copyRef.current.style.removeProperty('pointer-events')
      }
    }
  }, [pinHandoff])

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
      id="homepage-features"
      style={
        pinHandoff
          ? ({
              ['--intro-under-hero-margin' as string]: INTRO_UNDER_HERO_MARGIN,
              ['--intro-exit-pin-height' as string]: INTRO_EXIT_PIN_HEIGHT,
            } as CSSProperties)
          : undefined
      }
    >
      {pinHandoff ? (
        <div className={styles.introExitPin}>
          {/* Sticky stage — copy stays put until the first card is in view, then fades. */}
          <div className={`${styles.introText} ${styles.introTextSticky}`}>
            <div ref={copyRef} className={`armada-site-stack ${styles.introCopy}`}>
              {copyBlock}
            </div>
          </div>
        </div>
      ) : (
        <RevealStack motion="fade" className={`armada-site-stack ${styles.introText}`}>
          {copyBlock}
        </RevealStack>
      )}
    </div>
  )
}

export interface HomepageFeaturesProps {
  /**
   * Pull the privacy intro under the hero pin so copy fades in centered
   * as the hero dissolves to amber.
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

function FeaturePanel({
  block,
  isExitCard,
}: {
  block: Block
  isExitCard?: boolean
}) {
  const isCapital = block.id === 'capital-in-motion'
  const isCompliance = block.id === 'compliance'
  const isBeyondCapture = block.id === 'beyond-capture'
  const isFoundations = block.id === 'foundations'
  const isPanelSplit =
    isCapital || isCompliance || isBeyondCapture || isFoundations

  return (
    <article
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
      {...(isExitCard ? { 'data-privacy-exit-card': '' } : {})}
    >
      <FeatureCopy
        block={block}
        headingId={`${block.id}-heading`}
        contentClassName={styles.panelContent}
      />
      <FeatureDiagram id={block.id} />
    </article>
  )
}

/**
 * Desktop: one card per viewport with ≥80px padding; section bg shifts through
 * gem colors as cards enter. Mobile: normal stacked layout + paddings.
 */
function FeatureCardsBand({ overlapIntro = false }: { overlapIntro?: boolean }) {
  const desktop = useDesktopHandoff(true)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!desktop) {
      rootRef.current?.style.removeProperty('--features-tone')
      return
    }

    const root = rootRef.current
    if (!root) return

    let frame = 0
    let listening = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const scrub = () => {
      frame = 0
      if (reducedMotion.matches) {
        root.style.setProperty('--features-tone', '0')
        return
      }
      const scrollable = Math.max(1, root.offsetHeight - window.innerHeight)
      const raw = clamp01(-root.getBoundingClientRect().top / scrollable)
      root.style.setProperty('--features-tone', smoothstep(raw).toFixed(4))
    }

    const requestScrub = () => {
      if (frame) return
      frame = requestAnimationFrame(scrub)
    }

    const startListening = () => {
      if (listening) return
      listening = true
      window.addEventListener('scroll', requestScrub, { passive: true })
      window.addEventListener('resize', requestScrub)
      requestScrub()
    }

    const stopListening = () => {
      if (!listening) return
      listening = false
      window.removeEventListener('scroll', requestScrub)
      window.removeEventListener('resize', requestScrub)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startListening()
        else stopListening()
      },
      { root: null, threshold: 0, rootMargin: '15% 0px' },
    )

    io.observe(root)
    startListening()
    reducedMotion.addEventListener('change', requestScrub)

    return () => {
      io.disconnect()
      stopListening()
      reducedMotion.removeEventListener('change', requestScrub)
      if (frame) cancelAnimationFrame(frame)
      root.style.removeProperty('--features-tone')
    }
  }, [desktop])

  if (!desktop) {
    return (
      <div className={styles.features}>
        <div className={styles.stack}>
          {FEATURES.map((block) => (
            <FeaturePanel key={block.id} block={block} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={[
        styles.features,
        styles.featuresScroll,
        overlapIntro ? styles.featuresOverlapIntro : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        overlapIntro
          ? ({ ['--intro-card-overlap' as string]: INTRO_CARD_OVERLAP } as CSSProperties)
          : undefined
      }
    >
      {FEATURES.map((block, index) => (
        <div key={block.id} className={styles.cardViewport}>
          <div className={styles.stack}>
            <FeaturePanel block={block} isExitCard={index === 0} />
          </div>
        </div>
      ))}
    </div>
  )
}

function FeatureDiagram({ id }: { id: string }) {
  if (id === 'capital-in-motion') {
    return (
      <div className={styles.panelDiagram}>
        <Suspense fallback={null}>
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

export function HomepageFeatures({ introUnderHero = false }: HomepageFeaturesProps) {
  return (
    <section className={`${styles.section} ${styles.sectionIntroStack}`} aria-label="Features">
      <IntroCentered underHero={introUnderHero} />
      <FeatureCardsBand overlapIntro={introUnderHero} />
    </section>
  )
}
