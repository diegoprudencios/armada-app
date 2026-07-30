import heroBackground from '@/assets/landing-hero-bg.webp'
import styles from './MarketingHero.module.css'

export function MarketingHero() {
  return (
    <section className={styles.hero} aria-labelledby="marketing-hero-heading">
      <img className={styles.background} src={heroBackground} alt="" aria-hidden />
      <div className={styles.overlay} aria-hidden />

      <div className={styles.content}>
        <h1 id="marketing-hero-heading" className={styles.heading}>
          On-chain money that doesn&apos;t broadcast.
        </h1>
        <p className={styles.subhead}>
          Shielded payment rails for USDC. Built for DAOs, protocols, and the apps that move money
          between them.
        </p>
      </div>
    </section>
  )
}
