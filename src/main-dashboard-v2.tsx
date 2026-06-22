import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initDashboardBackground } from '@/utils/dashboardBackground'
import { initTheme } from '@/utils/theme'
import { ArmadaAppDashboardV2 } from './pages/ArmadaAppDashboardV2'

initTheme()
initDashboardBackground()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ArmadaAppDashboardV2 />
  </StrictMode>,
)
