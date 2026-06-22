import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import { initDashboardBackground } from '@/utils/dashboardBackground'
import { initTheme } from '@/utils/theme'
import { mountRoot } from '@/mountRoot'
import { ArmadaAppDashboardV2 } from './pages/ArmadaAppDashboardV2'

initTheme()
initDashboardBackground()

mountRoot(<ArmadaAppDashboardV2 />)
