import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { classifyTestingClick } from './clickTracking'
import {
  TESTING_OPEN_FEEDBACK_PROMPT,
  TESTING_SESSION_WINDOW_KEY,
} from './constants'
import { persistTestingAnswer, persistTestingSessionEnd } from './persistFeedback'
import {
  loadOrCreateTestingSession,
  persistTestingSessionSnapshot,
} from './sessionPersistence'
import type {
  ShowFlowQuestionInput,
  TestingFeedbackResponse,
  TestingFeedbackSource,
  TestingSession,
} from './types'

export interface ActiveTestingToast {
  questionId: string
  prompt: string
  firedAt: number
}

export interface SessionLoggerApi {
  session: TestingSession
  /** True after the first deposit completes — gates the floating icon mount. */
  hasCompletedFirstDeposit: boolean
  /** Call when the user's first deposit/shield action finishes. */
  notifyFirstDepositComplete: () => void
  /**
   * Registers a flow question (if new) and shows the testing toast.
   * Safe to call multiple times with the same id — re-fires toast, does not
   * duplicate firedFlowQuestions.
   */
  showFlowQuestion: (input: ShowFlowQuestionInput) => void
  dismissActiveToast: () => void
  activeToast: ActiveTestingToast | null
  panelOpen: boolean
  openPanel: () => void
  closePanel: () => void
  submitOpenFeedback: (answer: string) => void
  submitFlowAnswer: (
    questionId: string,
    prompt: string,
    answer: string,
    source: TestingFeedbackSource,
  ) => void
  /** Mark an overlay/flow screen for screensVisited. */
  trackScreen: (route: string) => void
  responsesForQuestion: (questionId: string) => TestingFeedbackResponse[]
}

const SessionLoggerContext = createContext<SessionLoggerApi | null>(null)

function syncSessionToWindow(session: TestingSession): void {
  if (typeof window === 'undefined') return
  ;(window as unknown as Record<string, TestingSession>)[TESTING_SESSION_WINDOW_KEY] = session
}

export interface TestingSessionLoggerProviderProps {
  children: ReactNode
}

export function TestingSessionLoggerProvider({ children }: TestingSessionLoggerProviderProps) {
  const boot = useMemo(() => loadOrCreateTestingSession(), [])
  const [session, setSession] = useState<TestingSession>(boot.session)
  const [hasCompletedFirstDeposit, setHasCompletedFirstDeposit] = useState(
    boot.hasCompletedFirstDeposit,
  )
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeToast, setActiveToast] = useState<ActiveTestingToast | null>(null)
  const [toastQueue, setToastQueue] = useState<ActiveTestingToast[]>([])

  const sessionRef = useRef(session)
  sessionRef.current = session
  const hasCompletedFirstDepositRef = useRef(hasCompletedFirstDeposit)
  hasCompletedFirstDepositRef.current = hasCompletedFirstDeposit

  const currentScreen = useCallback(() => {
    const visits = sessionRef.current.screensVisited
    const last = visits[visits.length - 1]
    return last?.route ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  }, [])

  useEffect(() => {
    syncSessionToWindow(session)
    persistTestingSessionSnapshot({
      session,
      hasCompletedFirstDeposit,
    })
  }, [session, hasCompletedFirstDeposit])

  useEffect(() => {
    const finalize = () => {
      const ended: TestingSession = {
        ...sessionRef.current,
        sessionEnd: Date.now(),
        screensVisited: sessionRef.current.screensVisited.map((visit, index, arr) =>
          index === arr.length - 1 && visit.exitedAt == null
            ? { ...visit, exitedAt: Date.now() }
            : visit,
        ),
      }
      sessionRef.current = ended
      syncSessionToWindow(ended)
      persistTestingSessionSnapshot({
        session: ended,
        hasCompletedFirstDeposit: hasCompletedFirstDepositRef.current,
      })
      console.log('[TestingFeedback] session end', ended)
      persistTestingSessionEnd(ended)
    }

    window.addEventListener('pagehide', finalize)
    window.addEventListener('beforeunload', finalize)
    return () => {
      window.removeEventListener('pagehide', finalize)
      window.removeEventListener('beforeunload', finalize)
    }
  }, [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const classified = classifyTestingClick(event.target)
      if (!classified) return
      setSession((prev) => ({
        ...prev,
        clickEvents: [
          ...prev.clickEvents,
          {
            element: classified.element,
            screen: currentScreen(),
            timestamp: Date.now(),
            type: classified.type,
          },
        ],
      }))
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [currentScreen])

  useEffect(() => {
    if (activeToast || toastQueue.length === 0) return
    const [next, ...rest] = toastQueue
    setActiveToast(next)
    setToastQueue(rest)
  }, [activeToast, toastQueue])

  const notifyFirstDepositComplete = useCallback(() => {
    setHasCompletedFirstDeposit(true)
  }, [])

  const trackScreen = useCallback((route: string) => {
    const now = Date.now()
    setSession((prev) => {
      const visits = [...prev.screensVisited]
      const last = visits[visits.length - 1]
      if (last && last.route === route && last.exitedAt == null) {
        return prev
      }
      if (last && last.exitedAt == null) {
        visits[visits.length - 1] = { ...last, exitedAt: now }
      }
      visits.push({ route, enteredAt: now, exitedAt: null })
      return { ...prev, screensVisited: visits }
    })
  }, [])

  const registerFiredQuestion = useCallback((input: ShowFlowQuestionInput, firedAt: number) => {
    setSession((prev) => {
      if (prev.firedFlowQuestions.some((q) => q.questionId === input.questionId)) {
        return prev
      }
      return {
        ...prev,
        firedFlowQuestions: [
          ...prev.firedFlowQuestions,
          {
            questionId: input.questionId,
            prompt: input.prompt,
            flow: input.flow,
            firedAt,
          },
        ],
      }
    })
  }, [])

  const showFlowQuestion = useCallback(
    (input: ShowFlowQuestionInput) => {
      const firedAt = Date.now()
      registerFiredQuestion(input, firedAt)
      const toast: ActiveTestingToast = {
        questionId: input.questionId,
        prompt: input.prompt,
        firedAt,
      }
      setToastQueue((queue) => [...queue, toast])
    },
    [registerFiredQuestion],
  )

  const dismissActiveToast = useCallback(() => {
    setActiveToast(null)
  }, [])

  const appendResponse = useCallback((entry: TestingFeedbackResponse) => {
    const sessionId = sessionRef.current.sessionId
    setSession((prev) => ({
      ...prev,
      feedbackResponses: [...prev.feedbackResponses, entry],
    }))
    persistTestingAnswer(sessionId, entry)
  }, [])

  const submitOpenFeedback = useCallback(
    (answer: string) => {
      const trimmed = answer.trim()
      if (!trimmed) return
      appendResponse({
        questionId: 'open',
        prompt: TESTING_OPEN_FEEDBACK_PROMPT,
        answer: trimmed,
        answeredAt: Date.now(),
        source: 'popover',
      })
    },
    [appendResponse],
  )

  const submitFlowAnswer = useCallback(
    (
      questionId: string,
      prompt: string,
      answer: string,
      source: TestingFeedbackSource,
    ) => {
      const trimmed = answer.trim()
      if (!trimmed) return
      appendResponse({
        questionId,
        prompt,
        answer: trimmed,
        answeredAt: Date.now(),
        source,
      })
    },
    [appendResponse],
  )

  const responsesForQuestion = useCallback(
    (questionId: string) =>
      session.feedbackResponses.filter((r) => r.questionId === questionId),
    [session.feedbackResponses],
  )

  const api = useMemo<SessionLoggerApi>(
    () => ({
      session,
      hasCompletedFirstDeposit,
      notifyFirstDepositComplete,
      showFlowQuestion,
      dismissActiveToast,
      activeToast,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      submitOpenFeedback,
      submitFlowAnswer,
      trackScreen,
      responsesForQuestion,
    }),
    [
      session,
      hasCompletedFirstDeposit,
      notifyFirstDepositComplete,
      showFlowQuestion,
      dismissActiveToast,
      activeToast,
      panelOpen,
      submitOpenFeedback,
      submitFlowAnswer,
      trackScreen,
      responsesForQuestion,
    ],
  )

  return (
    <SessionLoggerContext.Provider value={api}>{children}</SessionLoggerContext.Provider>
  )
}

export function useSessionLogger(): SessionLoggerApi {
  const ctx = useContext(SessionLoggerContext)
  if (!ctx) {
    throw new Error('useSessionLogger must be used within TestingSessionLoggerProvider')
  }
  return ctx
}
