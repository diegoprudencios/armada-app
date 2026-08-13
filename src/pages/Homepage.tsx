import { useEffect } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { MarketingHero } from '@/components/MarketingHero'
import {
  WhatIsArmada,
  type WhatIsArmadaFeaturesLayout,
} from '@/components/WhatIsArmada'
import { SiteFooter } from '@/components/SiteFooter'
import styles from './Homepage.module.css'

/** Footer end / iOS chrome fill — matches theme-overrides brand-amber. */
const HOMEPAGE_CHROME_FILL = '#f8d197'
const CHROME_FILL_CLASS = 'armada-homepage-chrome'

export interface HomepageProps {
  featuresLayout?: WhatIsArmadaFeaturesLayout
  /** Sticky hero scroll-exit (drift + dissolve). `/homepage` and `/homepage5`. */
  heroScrollExit?: boolean
}

export function Homepage({
  featuresLayout = 'stack',
  heroScrollExit = false,
}: HomepageProps) {
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    root.classList.add(CHROME_FILL_CLASS)
    body.classList.add(CHROME_FILL_CLASS)

    let themeMeta = document.querySelector('meta[name="theme-color"]')
    if (!themeMeta) {
      themeMeta = document.createElement('meta')
      themeMeta.setAttribute('name', 'theme-color')
      document.head.appendChild(themeMeta)
    }
    const previousTheme = themeMeta.getAttribute('content')
    themeMeta.setAttribute('content', HOMEPAGE_CHROME_FILL)

    return () => {
      root.classList.remove(CHROME_FILL_CLASS)
      body.classList.remove(CHROME_FILL_CLASS)
      if (previousTheme) themeMeta?.setAttribute('content', previousTheme)
    }
  }, [])

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className={styles.main}>
        <MarketingHero scrollExit={heroScrollExit} />
        <WhatIsArmada
          featuresLayout={featuresLayout}
          introUnderHero={heroScrollExit}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
