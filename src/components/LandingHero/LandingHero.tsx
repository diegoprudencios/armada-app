import { Button } from '@/components/Button'
import { openAppWithWallet } from '@/utils/appNavigation'
import heroBackground from '@/assets/landing-hero-bg.webp'
import landingLogo from '@/assets/landing-logo-white.png'
import styles from './LandingHero.module.css'

export default function LandingHero() {
  return (
    <section className={styles.hero} aria-label="Armada landing hero">
      <img className={styles.background} src={heroBackground} alt="" aria-hidden />
      <div className={styles.overlay} aria-hidden />

      <header className={styles.header}>
        <img className={styles.logo} src={landingLogo} alt="Armada" />
        <Button
          className={styles.openAppButton}
          variant="primary"
          size="md"
          label="Open App"
          showIcon={false}
          onClick={openAppWithWallet}
        />
      </header>

      <div className={styles.textBlock}>
        <p className={styles.eyebrow}>A CROWDFUNDED VENTURE</p>
        <h1 className={styles.heading}>Asset privacy infrastructure</h1>
      </div>
    </section>
  )
}
