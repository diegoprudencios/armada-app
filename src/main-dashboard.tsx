import './styles/global.css'
import './styles/tokens.css'
import './styles/theme-overrides.css'
import './styles/typography.css'
import { initDashboardBackground } from '@/utils/dashboardBackground'
import { initTheme } from '@/utils/theme'
import { mountRoot } from '@/mountRoot'
import { ArmadaAppDashboard } from './pages/ArmadaAppDashboard'

initTheme()
initDashboardBackground()

mountRoot(<ArmadaAppDashboard />)
