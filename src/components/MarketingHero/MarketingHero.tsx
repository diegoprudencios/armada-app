import heroBackground from '@/assets/new-fleet.webp'
import { Button } from '@/components/Button'
import { HeroUsdcSpinner } from './HeroUsdcSpinner'
import styles from './MarketingHero.module.css'

export function MarketingHero() {
  return (
    <section className={styles.hero} aria-labelledby="marketing-hero-heading">
      <img className={styles.background} src={heroBackground} alt="" aria-hidden />
      <div className={styles.overlay} aria-hidden />

      <div className={styles.content}>
        <div className={styles.bottom}>
          <div className={styles.intro}>
            <h1 id="marketing-hero-heading" className={styles.heading}>
              <span className={styles.headingLine}>Pluggable privacy</span>
              <span className={styles.headingLine}>infrastructure for stablecoins</span>
            </h1>
            <Button
              variant="primary"
              size="lg"
              label="Integrate Armada"
              showIcon={false}
              href="https://docs.armada.blue"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            />
          </div>

          <div className={styles.feature}>
            <HeroUsdcSpinner />
            <p className={styles.featureCopy}>
              <span className={styles.featureLine}>Armada protects USDC balances for on-chain</span>
              <span className={styles.featureLine}>
                asset managers and private capital platforms.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
