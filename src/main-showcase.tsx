import './styles/global.css'
import './styles/tokens.css'
import './styles/mobileLayout.css'
import './styles/typography.css'
import './styles/theme-overrides.css'
import { initTheme } from '@/utils/theme'
import { initDashboardBackground } from '@/utils/dashboardBackground'
import { mountRoot } from '@/mountRoot'
import { Showcase } from './pages/Showcase'

initTheme()
initDashboardBackground()

mountRoot(<Showcase />)
