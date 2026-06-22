import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTheme } from '@/utils/theme'
import { Showcase } from './pages/Showcase'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Showcase />
  </StrictMode>,
)
