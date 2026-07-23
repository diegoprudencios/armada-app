import type { ReactNode } from 'react'
import { TESTING_FEEDBACK_ENABLED } from './constants'
import { TestingFeedbackIcon } from './TestingFeedbackIcon'
import { TestingFeedbackPanel } from './TestingFeedbackPanel'
import { TestingToast } from './TestingToast'
import { TestingSessionLoggerProvider } from './useSessionLogger'

export interface TestingFeedbackLayerProps {
  children?: ReactNode
}

/**
 * Drop-in research/testing shell. Mount once at the app root when you are ready
 * to enable this layer — does not modify product UI by itself.
 *
 * Gated by `TESTING_FEEDBACK_ENABLED` in constants.ts.
 *
 * Usage:
 *   <TestingFeedbackLayer>
 *     <YourApp />
 *   </TestingFeedbackLayer>
 *
 * Then call hooks from a child:
 *   const { notifyFirstDepositComplete, showFlowQuestion, trackScreen } = useSessionLogger()
 */
export function TestingFeedbackLayer({ children }: TestingFeedbackLayerProps) {
  if (!TESTING_FEEDBACK_ENABLED) {
    return <>{children}</>
  }

  return (
    <TestingSessionLoggerProvider>
      {children}
      <TestingToast />
      <TestingFeedbackIcon />
      <TestingFeedbackPanel />
    </TestingSessionLoggerProvider>
  )
}
