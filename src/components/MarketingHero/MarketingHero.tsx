import { useEffect, useRef } from 'react'
import heroBackground from '@/assets/hero-fleet-centered.webp'
import heroBackgroundLegacy from '@/assets/new-fleet.webp'
import { Button } from '@/components/Button'
import { RevealStack } from '@/components/ScrollReveal'
import {
  HANDOFF,
  HERO_PIN_HEIGHT,
  remap01,
} from '@/constants/homepageHandoff'
import { HeroUsdcSpinner } from './HeroUsdcSpinner'
import styles from './MarketingHero.module.css'

/** Flip to true to restore the previous bottom-aligned hero layout. */
const SHOW_LEGACY_HERO = true

const HEADING_LINES = ['Pluggable privacy', 'infrastructure for stablecoins'] as const

const FEATURE_COPY =
  'Stablecoins are exposed by default. Armada protects USDC balances for organizational money on-chain.'

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

/** Smoothstep — soft start/end for scroll-scrubbed exit. */
function smoothstep(t: number) {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

function FeatureCard() {
  return (
    <div className={styles.feature}>
      <HeroUsdcSpinner />
      <p className={`armada-text-detail ${styles.featureCopy}`}>{FEATURE_COPY}</p>
    </div>
  )
}

function IntegrateCta({ className }: { className?: string }) {
  return (
    <Button
      variant="primary"
      size="lg"
      label="Integrate Armada"
      showIcon={false}
      href="https://docs.armada.blue"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    />
  )
}

export interface MarketingHeroProps {
  /**
   * Sticky scroll-exit: intro + USDC drift apart, hero image dissolves
   * into the section below. Intended for `/homepage` only.
   */
  scrollExit?: boolean
}

export function MarketingHero({ scrollExit = false }: MarketingHeroProps) {
  const pinRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const backgroundUrl = SHOW_LEGACY_HERO ? heroBackgroundLegacy : heroBackground
  const backgroundClass = [
    styles.background,
    SHOW_LEGACY_HERO && styles.backgroundBottom,
    scrollExit && styles.backgroundExit,
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    if (!scrollExit) return

    const pin = pinRef.current
    const stage = stageRef.current
    if (!pin || !stage) return

    const root = document.documentElement
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let listening = false

    const clearHandoffVars = () => {
      stage.style.removeProperty('--hero-exit')
      stage.style.removeProperty('--hero-fade')
      stage.style.removeProperty('pointer-events')
      root.style.removeProperty('--privacy-copy')
      delete root.dataset.privacyCopy
    }

    const scrub = () => {
      frame = 0

      if (reducedMotion.matches) {
        stage.style.setProperty('--hero-exit', '0')
        stage.style.setProperty('--hero-fade', '0')
        root.style.setProperty('--privacy-copy', '1')
        root.dataset.privacyCopy = 'on'
        stage.style.removeProperty('pointer-events')
        return
      }

      const rect = pin.getBoundingClientRect()
      const scrollable = Math.max(1, pin.offsetHeight - window.innerHeight)
      const raw = clamp01(-rect.top / scrollable)

      // 1) Amber first — hero drifts + stage fades out.
      const amber = smoothstep(remap01(raw, 0, HANDOFF.amberEnd))
      const drift = smoothstep(remap01(raw, 0, HANDOFF.amberEnd * 0.95))
      // 2) Then privacy copy fades in (on amber, still centered under the pin).
      const copy = smoothstep(remap01(raw, HANDOFF.copyStart, HANDOFF.copyEnd))

      stage.style.setProperty('--hero-exit', drift.toFixed(4))
      stage.style.setProperty('--hero-fade', amber.toFixed(4))
      root.style.setProperty('--privacy-copy', copy.toFixed(4))
      root.dataset.privacyCopy = copy > 0.45 ? 'on' : 'off'
      stage.style.pointerEvents = amber > 0.55 ? 'none' : ''
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
      { root: null, threshold: 0, rootMargin: '10% 0px' },
    )

    io.observe(pin)
    startListening()

    const onMotionChange = () => requestScrub()
    reducedMotion.addEventListener('change', onMotionChange)

    return () => {
      io.disconnect()
      stopListening()
      reducedMotion.removeEventListener('change', onMotionChange)
      if (frame) cancelAnimationFrame(frame)
      clearHandoffVars()
    }
  }, [scrollExit])

  const heroInner = SHOW_LEGACY_HERO ? (
    <div className={styles.contentLegacy}>
      <div className={styles.bottomLegacy}>
        <RevealStack
          className={`armada-site-stack ${styles.introLegacy} ${scrollExit ? styles.introExit : ''}`}
        >
          <h1
            id="marketing-hero-heading"
            className={`armada-text-title ${styles.headingLegacy}`}
          >
            {HEADING_LINES.map((line) => (
              <span key={line} className={styles.headingLine}>
                {line}
              </span>
            ))}
          </h1>
          <IntegrateCta className={styles.cta} />
        </RevealStack>
        <RevealStack
          immediate
          className={scrollExit ? styles.featureExit : undefined}
        >
          <FeatureCard />
        </RevealStack>
      </div>
    </div>
  ) : (
    <div className={styles.content}>
      <RevealStack
        className={`armada-site-stack ${styles.intro} ${scrollExit ? styles.introExit : ''}`}
      >
        <h1 id="marketing-hero-heading" className={`armada-text-title ${styles.heading}`}>
          {HEADING_LINES.map((line) => (
            <span key={line} className={styles.headingLine}>
              {line}
            </span>
          ))}
        </h1>
        <IntegrateCta className={styles.cta} />
      </RevealStack>

      <RevealStack
        immediate
        className={scrollExit ? styles.featureExit : undefined}
      >
        <FeatureCard />
      </RevealStack>
    </div>
  )

  if (!scrollExit) {
    return (
      <section className={styles.hero} aria-labelledby="marketing-hero-heading">
        <div
          className={backgroundClass}
          style={{ backgroundImage: `url(${backgroundUrl})` }}
          aria-hidden
        />
        <div className={styles.overlay} aria-hidden />
        {heroInner}
      </section>
    )
  }

  return (
    <section
      ref={pinRef}
      className={styles.heroPin}
      style={{ height: HERO_PIN_HEIGHT }}
      aria-labelledby="marketing-hero-heading"
    >
      <div ref={stageRef} className={styles.heroSticky}>
        <div
          className={backgroundClass}
          style={{ backgroundImage: `url(${backgroundUrl})` }}
          aria-hidden
        />
        <div className={styles.overlay} aria-hidden />
        {heroInner}
        {/* EXCEPTION — match WhatIsArmada privacy intro amber for seamless dissolve. */}
        <div className={styles.dissolve} aria-hidden />
      </div>
    </section>
  )
}
