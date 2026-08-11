import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/theme-overrides.css'
import { initTheme } from '@/utils/theme'
import { mountRoot } from '@/mountRoot'
import { LandingPage } from './pages/LandingPage'

initTheme()

mountRoot(<LandingPage />)
