import { SiteHeader } from '@/components/SiteHeader'
import { MarketingHero } from '@/components/MarketingHero'
import { GlobeStory } from '@/components/GlobeStory'
import styles from './Homepage2.module.css'

/**
 * Scrollytelling prototype — sticky globe + chapter copy.
 * Dev: http://localhost:5177/homepage2.html  ·  Prod route: /homepage2
 */
export function Homepage2() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className={styles.main}>
        <MarketingHero />
        <GlobeStory />
      </main>
    </div>
  )
}
