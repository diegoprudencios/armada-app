import { createTestingSessionId } from './createSessionId'
import { captureDeviceInfo } from './deviceInfo'
import type { TestingSession } from './types'

export const TESTING_SESSION_ID_STORAGE_KEY = 'armada-testing-feedback-session-id'
export const TESTING_SESSION_SNAPSHOT_STORAGE_KEY = 'armada-testing-feedback-session'

export interface TestingSessionSnapshot {
  session: TestingSession
  hasCompletedFirstDeposit: boolean
}

function readStoredSessionId(): string | null {
  try {
    const id = sessionStorage.getItem(TESTING_SESSION_ID_STORAGE_KEY)?.trim()
    return id || null
  } catch {
    return null
  }
}

function readSnapshot(): TestingSessionSnapshot | null {
  try {
    const raw = sessionStorage.getItem(TESTING_SESSION_SNAPSHOT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as TestingSessionSnapshot
    if (!parsed?.session?.sessionId) return null
    return parsed
  } catch {
    return null
  }
}

function writeSessionId(sessionId: string): void {
  try {
    sessionStorage.setItem(TESTING_SESSION_ID_STORAGE_KEY, sessionId)
  } catch {
    // private mode / quota
  }
}

export function persistTestingSessionSnapshot(snapshot: TestingSessionSnapshot): void {
  try {
    sessionStorage.setItem(TESTING_SESSION_ID_STORAGE_KEY, snapshot.session.sessionId)
    sessionStorage.setItem(TESTING_SESSION_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // private mode / quota
  }
}

function createFreshSession(): TestingSession {
  const now = Date.now()
  const route =
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  const sessionId = createTestingSessionId()
  writeSessionId(sessionId)
  return {
    sessionId,
    sessionStart: now,
    sessionEnd: null,
    deviceInfo: captureDeviceInfo(),
    screensVisited: [{ route, enteredAt: now, exitedAt: null }],
    firedFlowQuestions: [],
    feedbackResponses: [],
    clickEvents: [],
  }
}

/** Resume after reload: keep same sessionId + arrays; reopen current screen visit. */
function resumeFromSnapshot(snapshot: TestingSessionSnapshot): TestingSessionSnapshot {
  const now = Date.now()
  const route =
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  const visits = [...snapshot.session.screensVisited]
  const last = visits[visits.length - 1]

  if (last && last.route === route) {
    visits[visits.length - 1] = { ...last, exitedAt: null }
  } else {
    visits.push({ route, enteredAt: now, exitedAt: null })
  }

  const session: TestingSession = {
    ...snapshot.session,
    sessionEnd: null,
    screensVisited: visits,
    deviceInfo: snapshot.session.deviceInfo ?? captureDeviceInfo(),
  }

  return {
    session,
    hasCompletedFirstDeposit: snapshot.hasCompletedFirstDeposit,
  }
}

/**
 * Load existing tab session from sessionStorage, or start a new one.
 * sessionId is always written to sessionStorage so mid-test reloads reuse it.
 */
export function loadOrCreateTestingSession(): TestingSessionSnapshot {
  const storedId = readStoredSessionId()
  if (storedId) {
    const snapshot = readSnapshot()
    if (snapshot && snapshot.session.sessionId === storedId) {
      const resumed = resumeFromSnapshot(snapshot)
      persistTestingSessionSnapshot(resumed)
      return resumed
    }
    // ID present but no usable snapshot — keep the ID, start clean arrays.
    const now = Date.now()
    const route =
      typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
    const session: TestingSession = {
      sessionId: storedId,
      sessionStart: now,
      sessionEnd: null,
      deviceInfo: captureDeviceInfo(),
      screensVisited: [{ route, enteredAt: now, exitedAt: null }],
      firedFlowQuestions: [],
      feedbackResponses: [],
      clickEvents: [],
    }
    const fresh: TestingSessionSnapshot = {
      session,
      hasCompletedFirstDeposit: false,
    }
    persistTestingSessionSnapshot(fresh)
    return fresh
  }

  const session = createFreshSession()
  const fresh: TestingSessionSnapshot = {
    session,
    hasCompletedFirstDeposit: false,
  }
  persistTestingSessionSnapshot(fresh)
  return fresh
}
