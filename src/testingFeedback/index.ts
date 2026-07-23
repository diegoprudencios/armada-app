/**
 * Isolated research/testing feedback layer for the armada-app demo.
 * Strip this entire folder when the testing round is done.
 *
 * Mount when ready (does not auto-wire into the product app):
 *   import { TestingFeedbackLayer, useSessionLogger, ... } from '@/testingFeedback'
 *   <TestingFeedbackLayer><App /></TestingFeedbackLayer>
 */

export type {
  ActiveTestingToast,
  SessionLoggerApi,
  TestingSessionLoggerProviderProps,
} from './useSessionLogger'
export {
  TestingSessionLoggerProvider,
  useSessionLogger,
} from './useSessionLogger'

export type { TestingFeedbackLayerProps } from './TestingFeedbackLayer'
export { TestingFeedbackLayer } from './TestingFeedbackLayer'

export { TestingFeedbackIcon } from './TestingFeedbackIcon'
export { TestingFeedbackPanel } from './TestingFeedbackPanel'
export { TestingToast } from './TestingToast'

export type {
  ShowFlowQuestionInput,
  TestingClickEvent,
  TestingClickType,
  TestingDeviceInfo,
  TestingFeedbackResponse,
  TestingFeedbackSource,
  TestingFiredFlowQuestion,
  TestingFlowId,
  TestingScreenVisit,
  TestingSession,
} from './types'

export {
  TESTING_FEEDBACK_ENABLED,
  TESTING_FLOW_GROUP_ORDER,
  TESTING_FLOW_QUESTION_SHIELD_EXPECTATION,
  TESTING_FLOW_QUESTION_VAULT_DEPOSIT,
  TESTING_FLOW_QUESTION_WITHDRAW_PRIVACY,
  TESTING_FLOW_QUESTION_REQUEST_COMPREHENSION,
  TESTING_OPEN_FEEDBACK_PROMPT,
  TESTING_SESSION_WINDOW_KEY,
  TESTING_TOAST_AUTO_DISMISS_MS,
  testingFlowQuestionSendPrivacyCertainty,
  // Deprecated aliases
  TESTING_FLOW_QUESTION_SHIELD_DEPOSIT,
  testingFlowQuestionPrivateVsPublic,
} from './constants'

export type { TestingFeedbackLogEntry, TestingFeedbackLogKind } from './persistFeedback'
export {
  TESTING_FEEDBACK_API_PATH,
  persistTestingAnswer,
  persistTestingSessionEnd,
} from './persistFeedback'
