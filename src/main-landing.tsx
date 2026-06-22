import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTheme } from '@/utils/theme'
import { LandingPage } from './pages/LandingPage'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
)
