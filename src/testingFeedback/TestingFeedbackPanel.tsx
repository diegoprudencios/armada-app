import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { TESTING_FLOW_GROUP_ORDER, TESTING_OPEN_FEEDBACK_PROMPT } from './constants'
import { formatAnsweredAgo } from './formatAnsweredAgo'
import styles from './TestingFeedbackPanel.module.css'
import type { TestingFiredFlowQuestion, TestingFlowId } from './types'
import { useSessionLogger } from './useSessionLogger'

const THANKS_VISIBLE_MS = 2200

function groupFiredQuestions(
  fired: TestingFiredFlowQuestion[],
): Array<{ flow: TestingFlowId; questions: TestingFiredFlowQuestion[] }> {
  return TESTING_FLOW_GROUP_ORDER.flatMap((flow) => {
    const questions = fired.filter((q) => q.flow === flow)
    return questions.length > 0 ? [{ flow, questions }] : []
  })
}

/**
 * Non-modal research feedback panel (side sheet / bottom sheet).
 * No focus trap — tap outside or X to dismiss.
 */
export function TestingFeedbackPanel() {
  const {
    panelOpen,
    closePanel,
    session,
    submitOpenFeedback,
    submitFlowAnswer,
    responsesForQuestion,
  } = useSessionLogger()

  const titleId = useId()
  const openFieldId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const triggerRestoreRef = useRef<HTMLElement | null>(null)

  const [openDraft, setOpenDraft] = useState('')
  const [openThanks, setOpenThanks] = useState(false)
  const [flowDrafts, setFlowDrafts] = useState<Record<string, string>>({})
  const [nowTick, setNowTick] = useState(() => Date.now())

  useEscapeKey(closePanel, panelOpen)

  useEffect(() => {
    if (!panelOpen) return
    triggerRestoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frame = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus()
    })
    return () => {
      window.cancelAnimationFrame(frame)
      triggerRestoreRef.current?.focus?.()
      triggerRestoreRef.current = null
    }
  }, [panelOpen])

  useEffect(() => {
    if (!panelOpen) return
    const timer = window.setInterval(() => setNowTick(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [panelOpen])

  useEffect(() => {
    if (!openThanks) return
    const timer = window.setTimeout(() => setOpenThanks(false), THANKS_VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [openThanks])

  if (!panelOpen) return null

  const flowGroups = groupFiredQuestions(session.firedFlowQuestions)
  const showSectionB = flowGroups.length > 0

  const handleOpenSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!openDraft.trim()) return
    submitOpenFeedback(openDraft)
    setOpenDraft('')
    setOpenThanks(true)
  }

  const handleFlowSubmit = (questionId: string, prompt: string) => (event: FormEvent) => {
    event.preventDefault()
    const draft = flowDrafts[questionId] ?? ''
    if (!draft.trim()) return
    submitFlowAnswer(questionId, prompt, draft, 'popover')
    setFlowDrafts((prev) => ({ ...prev, [questionId]: '' }))
  }

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      data-testing-feedback-ui="panel-scrim"
      onClick={closePanel}
    >
      <div
        ref={panelRef}
        id="testing-feedback-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        className={styles.panel}
        data-testing-feedback-ui="panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Testing feedback
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeBtn}
            aria-label="Close testing feedback"
            onClick={closePanel}
          >
            <XMarkIcon className={styles.closeIcon} aria-hidden />
          </button>
        </div>

        <div className={styles.body}>
          <section className={styles.section} aria-labelledby={`${openFieldId}-heading`}>
            <h3 id={`${openFieldId}-heading`} className={styles.sectionTitle}>
              Open feedback
            </h3>
            <form className={styles.fieldRow} onSubmit={handleOpenSubmit}>
              <label htmlFor={openFieldId} className={styles.visuallyHidden}>
                Open feedback
              </label>
              <textarea
                id={openFieldId}
                className={styles.textarea}
                placeholder={TESTING_OPEN_FEEDBACK_PROMPT}
                value={openDraft}
                onChange={(event) => setOpenDraft(event.target.value)}
                rows={3}
              />
              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={!openDraft.trim()}
                >
                  Send
                </button>
                {openThanks ? (
                  <p className={styles.thanks} role="status">
                    Thanks, got it
                  </p>
                ) : null}
              </div>
            </form>
          </section>

          {showSectionB ? (
            <section className={styles.section} aria-labelledby="testing-flow-questions-heading">
              <h3 id="testing-flow-questions-heading" className={styles.sectionTitle}>
                Flow questions
              </h3>
              {flowGroups.map(({ flow, questions }) => {
                const groupHeadingId = `testing-flow-group-${flow}`
                return (
                  <div key={flow} className={styles.flowGroup} aria-labelledby={groupHeadingId}>
                    <h4 id={groupHeadingId} className={styles.flowGroupHeader}>
                      {flow}
                    </h4>
                    <ul className={styles.flowGroupList}>
                      {questions.map((question) => {
                        const prior = responsesForQuestion(question.questionId)
                        const hasResponded = prior.length > 0
                        const fieldId = `testing-flow-${question.questionId}`
                        const draft = flowDrafts[question.questionId] ?? ''

                        return (
                          <li key={question.questionId} className={styles.questionRow}>
                            <div className={styles.questionHeader}>
                              <p className={styles.questionPrompt}>{question.prompt}</p>
                              {hasResponded ? (
                                <CheckIcon
                                  className={styles.checkMark}
                                  role="img"
                                  aria-label="Responded at least once"
                                />
                              ) : null}
                            </div>

                            {hasResponded ? (
                              <ul className={styles.priorAnswers}>
                                {prior.map((entry) => (
                                  <li
                                    key={`${entry.answeredAt}-${entry.answer.slice(0, 12)}`}
                                    className={styles.priorAnswer}
                                  >
                                    <span className={styles.priorMeta}>
                                      {formatAnsweredAgo(entry.answeredAt, nowTick)}
                                    </span>
                                    <p className={styles.priorText}>{entry.answer}</p>
                                  </li>
                                ))}
                              </ul>
                            ) : null}

                            <form
                              className={styles.fieldRow}
                              onSubmit={handleFlowSubmit(question.questionId, question.prompt)}
                            >
                              <label htmlFor={fieldId} className={styles.visuallyHidden}>
                                Answer for: {question.prompt}
                              </label>
                              <input
                                id={fieldId}
                                className={styles.input}
                                type="text"
                                value={draft}
                                onChange={(event) =>
                                  setFlowDrafts((prev) => ({
                                    ...prev,
                                    [question.questionId]: event.target.value,
                                  }))
                                }
                                placeholder="Add a reply…"
                                autoComplete="off"
                              />
                              <div className={styles.actions}>
                                <button
                                  type="submit"
                                  className={styles.sendBtn}
                                  disabled={!draft.trim()}
                                >
                                  Send
                                </button>
                              </div>
                            </form>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </section>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
