/** Research/testing session log — not a product analytics schema. */

export type TestingFeedbackSource = 'toast' | 'popover'

export type TestingClickType = 'click' | 'dead_click'

/** Product flow bucket for Section B grouping. */
export type TestingFlowId = 'Deposit' | 'Send' | 'Vault' | 'Withdraw' | 'Request'

export interface TestingScreenVisit {
  route: string
  enteredAt: number
  exitedAt: number | null
}

export interface TestingFiredFlowQuestion {
  questionId: string
  prompt: string
  flow: TestingFlowId
  firedAt: number
}

export interface TestingFeedbackResponse {
  questionId: string | 'open'
  prompt: string
  answer: string
  answeredAt: number
  source: TestingFeedbackSource
}

export interface TestingClickEvent {
  element: string
  screen: string
  timestamp: number
  type: TestingClickType
}

export interface TestingDeviceInfo {
  userAgent: string
  platform: string
  viewportWidth: number
  viewportHeight: number
}

export interface TestingSession {
  sessionId: string
  sessionStart: number
  sessionEnd: number | null
  deviceInfo: TestingDeviceInfo
  screensVisited: TestingScreenVisit[]
  firedFlowQuestions: TestingFiredFlowQuestion[]
  feedbackResponses: TestingFeedbackResponse[]
  clickEvents: TestingClickEvent[]
}

export interface ShowFlowQuestionInput {
  questionId: string
  prompt: string
  flow: TestingFlowId
}

export type TestingToastStatus = 'idle' | 'visible' | 'leaving'
