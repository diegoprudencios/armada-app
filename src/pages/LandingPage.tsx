import LandingHero from '@/components/LandingHero'
import styles from './LandingPage.module.css'

export function LandingPage() {
  return (
    <main className={styles.page}>
      <LandingHero />
    </main>
  )
}
