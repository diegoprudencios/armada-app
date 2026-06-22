import { getAppliedTheme, setTheme, type Theme } from '@/utils/theme'
import styles from './App.module.css'

export function App() {
  const theme = getAppliedTheme()

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    window.location.reload()
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={`armada-text-ui-label-tag ${styles.eyebrow}`}>Armada App</p>
        <h1 className={`armada-text-display-md ${styles.title}`}>Privacy payments for USDC</h1>
        <p className={`armada-text-ui-body-lg ${styles.lead}`}>
          Consumer app scaffold — tokens, typography, and theme are wired up.
        </p>
      </header>

      <section className={styles.card} aria-labelledby="tokens-heading">
        <h2 id="tokens-heading" className={`armada-text-ui-heading-sm ${styles.cardTitle}`}>
          Design tokens
        </h2>
        <p className={`armada-text-ui-body-sm ${styles.cardBody}`}>
          Colors and spacing use semantic CSS variables from{' '}
          <code className={styles.code}>src/styles/tokens.css</code>. Run{' '}
          <code className={styles.code}>npm run tokens:sync</code> to pull updates from
          armada-crowdfund and armada-poc.
        </p>
        <div className={styles.swatchRow} aria-hidden="true">
          <span className={styles.swatchLavender} />
          <span className={styles.swatchAmber} />
          <span className={styles.swatchSurface} />
        </div>
      </section>

      <button type="button" className={styles.themeToggle} onClick={toggleTheme}>
        Switch to {theme === 'dark' ? 'light' : 'dark'} mode
      </button>
    </div>
  )
}
