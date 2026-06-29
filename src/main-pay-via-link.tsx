import './styles/global.css'
import './styles/tokens.css'
import './styles/theme-overrides.css'
import './styles/typography.css'
import { initTheme } from '@/utils/theme'
import { mountRoot } from '@/mountRoot'
import { PayViaLinkLanding } from './pages/PayViaLinkLanding'

initTheme()

mountRoot(<PayViaLinkLanding />)
