import { useEffect, useId, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { TESTING_TOAST_AUTO_DISMISS_MS } from './constants'
import styles from './TestingToast.module.css'
import { useSessionLogger } from './useSessionLogger'

/**
 * Non-blocking research toast. Separate from product notifications.
 * Registers the question into firedFlowQuestions via showFlowQuestion before display.
 */
export function TestingToast() {
  const {
    activeToast,
    dismissActiveToast,
    submitFlowAnswer,
    hasCompletedFirstDeposit,
  } = useSessionLogger()

  const fieldId = useId()
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setDraft('')
  }, [activeToast?.questionId, activeToast?.firedAt])

  useEffect(() => {
    if (!activeToast) return
    const timer = window.setTimeout(() => {
      dismissActiveToast()
    }, TESTING_TOAST_AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [activeToast, dismissActiveToast])

  if (!activeToast) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.trim()) return
    submitFlowAnswer(activeToast.questionId, activeToast.prompt, draft, 'toast')
    setDraft('')
    dismissActiveToast()
  }

  const toastClass = [
    styles.toast,
    hasCompletedFirstDeposit ? '' : styles.toastWithoutIcon,
  ]
    .filter(Boolean)
    .join(' ')

  return createPortal(
    <div
      className={toastClass}
      role="region"
      aria-label="Testing feedback prompt"
      data-testing-feedback-ui="toast"
    >
      <div className={styles.topRow}>
        <p className={styles.prompt} id={`${fieldId}-prompt`}>
          {activeToast.prompt}
        </p>
        <button
          type="button"
          className={styles.dismissBtn}
          aria-label="Dismiss testing prompt"
          onClick={dismissActiveToast}
        >
          <XMarkIcon className={styles.dismissIcon} aria-hidden />
        </button>
      </div>
      <form className={styles.formRow} onSubmit={handleSubmit}>
        <label htmlFor={fieldId} className={styles.visuallyHidden}>
          Optional reply
        </label>
        <input
          id={fieldId}
          className={styles.input}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Optional reply"
          autoComplete="off"
          aria-describedby={`${fieldId}-prompt`}
        />
        <button type="submit" className={styles.sendBtn} disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </div>,
    document.body,
  )
}
