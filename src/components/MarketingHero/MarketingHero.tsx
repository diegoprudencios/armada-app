import heroBackground from '@/assets/new-fleet.webp'
import { Button } from '@/components/Button'
import styles from './MarketingHero.module.css'

export function MarketingHero() {
  return (
    <section className={styles.hero} aria-labelledby="marketing-hero-heading">
      <img className={styles.background} src={heroBackground} alt="" aria-hidden />
      <div className={styles.overlay} aria-hidden />

      <div className={styles.content}>
        <h1 id="marketing-hero-heading" className={styles.heading}>
          Pluggable privacy
          <br />
          infrastructure for stablecoins.
        </h1>
        <p className={styles.subhead}>
          Stablecoins are exposed by default. Armada protects USDC balances for on-chain asset
          managers and private capital platforms.
        </p>
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
    </section>
  )
}
