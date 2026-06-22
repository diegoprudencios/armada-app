import { Analytics } from '@vercel/analytics/react'
import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

export function mountRoot(app: ReactNode) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {app}
      <Analytics />
    </StrictMode>,
  )
}
