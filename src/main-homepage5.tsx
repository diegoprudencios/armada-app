import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/theme-overrides.css'
import { initTheme } from '@/utils/theme'
import { mountRoot } from '@/mountRoot'
import { Homepage5 } from './pages/Homepage5'

initTheme()

mountRoot(<Homepage5 />)
