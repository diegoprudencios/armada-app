import { TESTING_PRIMARY_ACTION_PATTERNS } from './constants'
import type { TestingClickType } from './types'

const INTERACTIVE_SELECTOR =
  'button, a[href], input, select, textarea, summary, [role="button"], [role="link"], [role="menuitem"], [role="tab"], [role="checkbox"], [role="switch"]'

/** Fallback label → stable id when data-testing-click is not set. */
const LABEL_CLICK_ID_MAP: Record<string, string> = {
  deposit: 'deposit_button',
  'make your first deposit': 'deposit_first_button',
  send: 'send_button',
  request: 'request_button',
  withdraw: 'withdraw_og_button',
  earn: 'vault_open_button',
  'deposit to the vault': 'vault_deposit_choose_button',
  'withdraw from the vault': 'vault_withdraw_choose_button',
  'create link': 'request_create_link_button',
  'confirm send': 'send_confirm_button',
  'confirm deposit': 'deposit_confirm_button',
  'confirm withdrawal': 'withdraw_og_confirm_button',
  'input amount': 'request_amount_continue_button',
  continue: 'send_recipient_continue_button',
}

function getAccessibleLabel(el: Element): string {
  if (el instanceof HTMLElement) {
    const labelledBy = el.getAttribute('aria-labelledby')
    if (labelledBy) {
      const parts = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim())
        .filter(Boolean)
      if (parts.length > 0) return parts.join(' ')
    }
    const ariaLabel = el.getAttribute('aria-label')?.trim()
    if (ariaLabel) return ariaLabel
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) {
    const value = el.value?.trim()
    if (value && el instanceof HTMLInputElement && el.type === 'submit') return value
  }
  const text = el.textContent?.replace(/\s+/g, ' ').trim()
  if (text) return text.slice(0, 120)
  if (el instanceof HTMLElement) {
    const title = el.getAttribute('title')?.trim()
    if (title) return title
  }
  return el.tagName.toLowerCase()
}

function describeElement(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${el.id}` : ''
  const cls =
    el instanceof HTMLElement && el.className
      ? `.${String(el.className)
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 3)
          .join('.')}`
      : ''
  const label = getAccessibleLabel(el)
  return `${tag}${id}${cls}${label ? ` "${label.slice(0, 60)}"` : ''}`.slice(0, 160)
}

function resolveElementId(el: Element): string {
  const dataId = el.getAttribute('data-testing-click')?.trim()
  if (dataId) return dataId.slice(0, 120)

  const label = getAccessibleLabel(el)
  const mapped = LABEL_CLICK_ID_MAP[label.trim().toLowerCase()]
  if (mapped) return mapped

  return label.slice(0, 120) || describeElement(el)
}

function matchesPrimaryAction(label: string, elementId: string): boolean {
  if (elementId !== label && Object.values(LABEL_CLICK_ID_MAP).includes(elementId)) {
    return true
  }
  return TESTING_PRIMARY_ACTION_PATTERNS.some((pattern) => pattern.test(label))
}

function isInsideTestingFeedbackUi(el: Element): boolean {
  return Boolean(el.closest('[data-testing-feedback-ui]'))
}

function isInteractiveDisabled(el: Element): boolean {
  if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
    if (el.disabled) return true
  }
  if (el instanceof HTMLAnchorElement && el.getAttribute('aria-disabled') === 'true') {
    return true
  }
  if (el instanceof HTMLElement && el.getAttribute('aria-disabled') === 'true') {
    return true
  }
  return false
}

function looksTappableNonInteractive(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.closest(INTERACTIVE_SELECTOR)) return false
  if (el.closest('[data-testing-feedback-ui]')) return false

  const role = el.getAttribute('role')
  if (role === 'button' || role === 'link' || role === 'menuitem' || role === 'tab') {
    return true
  }

  const tabIndex = el.getAttribute('tabindex')
  if (tabIndex != null && tabIndex !== '-1') return true

  try {
    const style = window.getComputedStyle(el)
    if (style.cursor === 'pointer') return true
    if (style.pointerEvents === 'none') return false
  } catch {
    return false
  }

  return false
}

export interface ClassifiedTestingClick {
  element: string
  type: TestingClickType
}

/**
 * Flat click classifier for research logging.
 * Primary action buttons → click; disabled or pointer-only → dead_click.
 */
export function classifyTestingClick(target: EventTarget | null): ClassifiedTestingClick | null {
  if (!(target instanceof Element)) return null
  if (isInsideTestingFeedbackUi(target)) return null

  const interactive = target.closest(INTERACTIVE_SELECTOR)
  if (interactive) {
    const elementId = resolveElementId(interactive)
    const label = getAccessibleLabel(interactive)
    const isPrimary =
      interactive.hasAttribute('data-testing-click') || matchesPrimaryAction(label, elementId)

    if (isInteractiveDisabled(interactive)) {
      return { element: elementId, type: 'dead_click' }
    }

    if (isPrimary) {
      return { element: elementId, type: 'click' }
    }

    return null
  }

  let node: Element | null = target
  while (node && node !== document.body) {
    if (looksTappableNonInteractive(node)) {
      return { element: describeElement(node), type: 'dead_click' }
    }
    node = node.parentElement
  }

  return null
}
