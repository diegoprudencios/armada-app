import { useEffect, useLayoutEffect, useRef, useState, type AnimationEvent } from 'react'
import heroBackground from '@/assets/new-fleet.webp'
import { Button } from '@/components/Button'
import {
  HANDOFF,
  HERO_PIN_HEIGHT,
  remap01,
} from '@/constants/homepageHandoff'
import { useDesktopHandoff } from '@/hooks/useDesktopHandoff'
import { HeroUsdcSpinner } from './HeroUsdcSpinner'
import styles from './MarketingHero.module.css'

/** Bottom-aligned hero layout (production). */
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

function FeatureCard({
  className,
  onAnimationEnd,
}: {
  className?: string
  onAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void
}) {
  return (
    <div
      className={[styles.feature, className].filter(Boolean).join(' ')}
      onAnimationEnd={onAnimationEnd}
    >
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
   * into the section below. Desktop `/` homepage only — mobile is a normal hero.
   */
  scrollExit?: boolean
}

/** Keep in sync with `.backgroundSettle` duration. */
const HERO_BG_SETTLE_MS = 920
const HERO_HEADER_TO_COPY_MS = 180
const HERO_COPY_TO_USDC_MS = 220

export function MarketingHero({ scrollExit = false }: MarketingHeroProps) {
  const pinRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pinHandoff = useDesktopHandoff(scrollExit)
  const [copyReady, setCopyReady] = useState(false)
  const [copyEntered, setCopyEntered] = useState(false)
  const [usdcReady, setUsdcReady] = useState(false)
  const [usdcEntered, setUsdcEntered] = useState(false)
  const [settleBg, setSettleBg] = useState(true)

  const backgroundClass = [
    styles.background,
    styles.backgroundBottom,
    settleBg && styles.backgroundSettle,
  ]
    .filter(Boolean)
    .join(' ')

  useLayoutEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (reduced.matches) {
      root.dataset.heroEnter = 'chrome'
      setCopyReady(true)
      setCopyEntered(true)
      setUsdcReady(true)
      setUsdcEntered(true)
      setSettleBg(false)
      return
    }

    root.dataset.heroEnter = 'bg'
    const headerAt = HERO_BG_SETTLE_MS
    const copyAt = headerAt + HERO_HEADER_TO_COPY_MS
    const usdcAt = copyAt + HERO_COPY_TO_USDC_MS
    const timers = [
      window.setTimeout(() => {
        root.dataset.heroEnter = 'chrome'
      }, headerAt),
      window.setTimeout(() => setCopyReady(true), copyAt),
      window.setTimeout(() => setUsdcReady(true), usdcAt),
    ]

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      delete root.dataset.heroEnter
    }
  }, [])

  useEffect(() => {
    if (!pinHandoff) return

    const pin = pinRef.current
    const stage = stageRef.current
    if (!pin || !stage) return

    const root = document.documentElement
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const applyRest = () => {
      stage.style.setProperty('--hero-exit', '0')
      stage.style.setProperty('--hero-fade', '0')
      stage.style.setProperty('--hero-clear', '0')
      stage.style.opacity = '1'
      stage.style.removeProperty('pointer-events')
      pin.style.zIndex = '2'
      stage.dataset.heroAtRest = 'true'
      root.style.setProperty('--privacy-copy', '0')
      root.style.setProperty('--privacy-exit', '0')
      root.dataset.privacyCopy = 'off'
    }

    const clearHandoffVars = () => {
      stage.style.removeProperty('--hero-exit')
      stage.style.removeProperty('--hero-fade')
      stage.style.removeProperty('--hero-clear')
      stage.style.removeProperty('opacity')
      stage.style.removeProperty('pointer-events')
      pin.style.removeProperty('z-index')
      delete stage.dataset.heroAtRest
      root.style.removeProperty('--privacy-copy')
      root.style.removeProperty('--privacy-exit')
      delete root.dataset.privacyCopy
    }

    const scrub = () => {
      frame = 0

      if (reducedMotion.matches) {
        applyRest()
        root.style.setProperty('--privacy-copy', '1')
        root.dataset.privacyCopy = 'on'
        return
      }

      const scrollable = Math.max(1, pin.offsetHeight - window.innerHeight)
      const raw = clamp01(-pin.getBoundingClientRect().top / scrollable)

      if (raw <= 0.002) {
        applyRest()
        return
      }

      delete stage.dataset.heroAtRest

      const amber = smoothstep(remap01(raw, 0, HANDOFF.amberEnd))
      const drift = smoothstep(remap01(raw, 0, HANDOFF.amberEnd * 0.95))
      const clear = smoothstep(remap01(raw, HANDOFF.clearStart, HANDOFF.clearEnd))
      const copy = smoothstep(remap01(raw, HANDOFF.copyStart, HANDOFF.copyEnd))

      stage.style.setProperty('--hero-exit', drift.toFixed(4))
      stage.style.setProperty('--hero-fade', amber.toFixed(4))
      stage.style.setProperty('--hero-clear', clear.toFixed(4))
      stage.style.opacity = (1 - clear).toFixed(4)
      root.style.setProperty('--privacy-copy', copy.toFixed(4))
      root.dataset.privacyCopy = copy > 0.01 ? 'on' : 'off'

      if (clear >= 0.999) {
        stage.style.pointerEvents = 'none'
        pin.style.zIndex = '0'
      } else {
        stage.style.removeProperty('pointer-events')
        pin.style.zIndex = '2'
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

    const onMotionChange = () => requestScrub()
    reducedMotion.addEventListener('change', onMotionChange)

    return () => {
      window.removeEventListener('scroll', requestScrub)
      window.removeEventListener('resize', requestScrub)
      window.removeEventListener('scrollend', requestScrub)
      reducedMotion.removeEventListener('change', onMotionChange)
      if (frame) cancelAnimationFrame(frame)
      clearHandoffVars()
    }
  }, [pinHandoff])

  const heroCopy = (
    <>
      <h1
        id="marketing-hero-heading"
        className={`armada-text-title ${styles.heading}`}
      >
        {HEADING_LINES.map((line) => (
          <span key={line} className={styles.headingLine}>
            {line}
          </span>
        ))}
      </h1>
      <IntegrateCta className={styles.cta} />
    </>
  )

  const introClass = pinHandoff
    ? `armada-site-stack ${styles.intro} ${styles.introExit}`
    : `armada-site-stack ${styles.intro}`

  const backgroundNode = (
    <div
      className={backgroundClass}
      style={{ backgroundImage: `url(${heroBackground})` }}
      aria-hidden
      onAnimationEnd={() => setSettleBg(false)}
    />
  )

  const finishCopyEnter = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setCopyEntered(true)
  }
  const finishUsdcEnter = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setUsdcEntered(true)
  }

  const usdcEnterClass = !usdcReady
    ? styles.chromePending
    : usdcEntered
      ? undefined
      : styles.featureEnter

  const heroInner = (
    <div className={styles.content}>
      <div className={styles.bottom}>
        {copyReady ? (
          <div
            className={[introClass, !copyEntered && styles.copyEnter]
              .filter(Boolean)
              .join(' ')}
            onAnimationEnd={finishCopyEnter}
          >
            {heroCopy}
          </div>
        ) : (
          <div className={`${styles.intro} ${styles.chromePending}`} aria-hidden>
            {heroCopy}
          </div>
        )}
        {pinHandoff ? (
          <div className={styles.featureExit}>
            <FeatureCard className={usdcEnterClass} onAnimationEnd={finishUsdcEnter} />
          </div>
        ) : (
          <FeatureCard className={usdcEnterClass} onAnimationEnd={finishUsdcEnter} />
        )}
      </div>
    </div>
  )

  if (!pinHandoff) {
    return (
      <section className={styles.hero} aria-labelledby="marketing-hero-heading">
        {backgroundNode}
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
        <div className={styles.backgroundExit} aria-hidden>
          {backgroundNode}
        </div>
        <div className={styles.overlay} aria-hidden />
        {heroInner}
        {/* EXCEPTION — match HomepageFeatures privacy intro amber for seamless dissolve. */}
        <div className={styles.dissolve} aria-hidden />
      </div>
    </section>
  )
}
