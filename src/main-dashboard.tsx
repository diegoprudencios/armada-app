import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ArmadaAppDashboard } from './pages/ArmadaAppDashboard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ArmadaAppDashboard />
  </StrictMode>,
)
