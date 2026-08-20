import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { IconButton } from '@/components/IconButton'
import { useTheme } from '@/hooks/useTheme'
import styles from './ThemeToggle.module.css'

/** Preview control — switch light / dark. Persists to localStorage (`armada-theme`). */
export function ThemeToggle() {
  const [theme, , toggleTheme] = useTheme()
  const isDark = theme === 'dark'

  return (
    <IconButton
      variant="frosted"
      size="sm"
      className={styles.button}
      iconClassName={styles.glyph}
      icon={isDark ? <SunIcon strokeWidth={1.5} /> : <MoonIcon strokeWidth={1.5} />}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    />
  )
}
