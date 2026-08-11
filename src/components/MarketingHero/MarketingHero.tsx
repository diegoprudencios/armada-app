import heroBackground from '@/assets/hero-fleet-centered.webp'
import heroBackgroundLegacy from '@/assets/new-fleet.webp'
import { Button } from '@/components/Button'
import { HeroUsdcSpinner } from './HeroUsdcSpinner'
import styles from './MarketingHero.module.css'

/** Flip to true to restore the previous bottom-aligned hero layout. */
const SHOW_LEGACY_HERO = true

const HEADING_LINES = ['Pluggable privacy', 'infrastructure for stablecoins'] as const

const FEATURE_COPY =
  'Stablecoins are exposed by default. Armada protects USDC balances for organizational money on-chain.'

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

export function MarketingHero() {
  const backgroundUrl = SHOW_LEGACY_HERO ? heroBackgroundLegacy : heroBackground
  const backgroundClass = [
    styles.background,
    SHOW_LEGACY_HERO && styles.backgroundBottom,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={styles.hero} aria-labelledby="marketing-hero-heading">
      <div
        className={backgroundClass}
        style={{ backgroundImage: `url(${backgroundUrl})` }}
        aria-hidden
      />
      <div className={styles.overlay} aria-hidden />

      {SHOW_LEGACY_HERO ? (
        <div className={styles.contentLegacy}>
          <div className={styles.bottomLegacy}>
            <div className={`armada-site-stack ${styles.introLegacy}`}>
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
            </div>
            <FeatureCard />
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={`armada-site-stack ${styles.intro}`}>
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
          </div>

          <FeatureCard />
        </div>
      )}
    </section>
  )
}
