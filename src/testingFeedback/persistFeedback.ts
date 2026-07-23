import type { TestingFeedbackResponse, TestingSession } from './types'

export type TestingFeedbackLogKind = 'answer' | 'session_end'

/** One append-only log line (NDJSON locally / one Blob object in prod). */
export interface TestingFeedbackLogEntry {
  kind: TestingFeedbackLogKind
  receivedAt: number
  sessionId: string
  path: string
  userAgent: string
  /** Present when kind === 'answer' */
  response?: TestingFeedbackResponse
  /** Present when kind === 'session_end' */
  session?: TestingSession
}

export const TESTING_FEEDBACK_API_PATH = '/api/testing-feedback'

function baseMeta(sessionId: string): Pick<TestingFeedbackLogEntry, 'receivedAt' | 'sessionId' | 'path' | 'userAgent'> {
  return {
    receivedAt: Date.now(),
    sessionId,
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  }
}

function postJson(body: TestingFeedbackLogEntry): void {
  const payload = JSON.stringify(body)
  try {
    void fetch(TESTING_FEEDBACK_API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch((error: unknown) => {
      console.warn('[TestingFeedback] persist failed', error)
    })
  } catch (error) {
    console.warn('[TestingFeedback] persist failed', error)
  }
}

function beaconOrPost(body: TestingFeedbackLogEntry): void {
  const payload = JSON.stringify(body)
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' })
      const ok = navigator.sendBeacon(TESTING_FEEDBACK_API_PATH, blob)
      if (ok) return
    }
  } catch {
    // fall through to fetch
  }
  postJson(body)
}

/** Persist a single answer as soon as the tester submits it. */
export function persistTestingAnswer(
  sessionId: string,
  response: TestingFeedbackResponse,
): void {
  postJson({
    kind: 'answer',
    ...baseMeta(sessionId),
    response,
  })
}

/** Persist the full session snapshot on unload (best-effort). */
export function persistTestingSessionEnd(session: TestingSession): void {
  beaconOrPost({
    kind: 'session_end',
    ...baseMeta(session.sessionId),
    session,
  })
}
