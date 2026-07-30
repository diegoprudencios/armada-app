import { SiteHeader } from '@/components/SiteHeader'
import { MarketingHero } from '@/components/MarketingHero'
import { WhatIsArmada } from '@/components/WhatIsArmada'
import { SiteFooter } from '@/components/SiteFooter'
import styles from './Homepage.module.css'

export function Homepage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className={styles.main}>
        <MarketingHero />
        <WhatIsArmada />
      </main>
      <SiteFooter />
    </div>
  )
}
