import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import styles from './TestingFeedbackIcon.module.css'
import { useSessionLogger } from './useSessionLogger'

const LABEL_TAP_MS = 1800

/**
 * Floating research feedback entry — unmounted until first deposit completes.
 * Deliberately plain / debug-tool styling. Not part of the product UI.
 */
export function TestingFeedbackIcon() {
  const { hasCompletedFirstDeposit, panelOpen, openPanel, closePanel } = useSessionLogger()
  const [labelVisible, setLabelVisible] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (!labelVisible || hovering) return
    const timer = window.setTimeout(() => setLabelVisible(false), LABEL_TAP_MS)
    return () => window.clearTimeout(timer)
  }, [labelVisible, hovering])

  if (!hasCompletedFirstDeposit) return null

  const showLabel = hovering || labelVisible

  return createPortal(
    <div className={styles.iconRoot} data-testing-feedback-ui="icon">
      <span
        className={[styles.label, showLabel ? styles.labelVisible : ''].filter(Boolean).join(' ')}
        aria-hidden={!showLabel}
      >
        Feedback
      </span>
      <button
        type="button"
        className={styles.fab}
        aria-label="Open testing feedback"
        aria-expanded={panelOpen}
        aria-controls="testing-feedback-panel"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
        onClick={() => {
          if (panelOpen) {
            closePanel()
            return
          }
          setLabelVisible(true)
          openPanel()
        }}
      >
        <ChatBubbleLeftEllipsisIcon className={styles.fabIcon} aria-hidden />
      </button>
    </div>,
    document.body,
  )
}
