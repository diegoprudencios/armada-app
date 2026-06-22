import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import { initTheme } from '@/utils/theme'
import { mountRoot } from '@/mountRoot'
import { Showcase } from './pages/Showcase'

initTheme()

mountRoot(<Showcase />)
