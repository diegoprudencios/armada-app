import type { ShowFlowQuestionInput, TestingFlowId } from './types'

/** Display order for Section B flow groups. */
export const TESTING_FLOW_GROUP_ORDER: readonly TestingFlowId[] = [
  'Deposit',
  'Send',
  'Vault',
  'Withdraw',
  'Request',
] as const

/** Deposit → shield_expectation */
export const TESTING_FLOW_QUESTION_SHIELD_EXPECTATION: ShowFlowQuestionInput = {
  questionId: 'shield_expectation',
  flow: 'Deposit',
  prompt:
    "You just moved USDC into shielded balance. Does 'shielded' match what you expected based on what you know about Armada?",
}

/** Send → send_privacy_certainty */
export function testingFlowQuestionSendPrivacyCertainty(
  mode: 'private' | 'public',
): ShowFlowQuestionInput {
  return {
    questionId: 'send_privacy_certainty',
    flow: 'Send',
    prompt: `Right before you hit send, how sure were you this was going ${mode}? What told you that?`,
  }
}

/** Vault → vault_deposit_expectation */
export const TESTING_FLOW_QUESTION_VAULT_DEPOSIT: ShowFlowQuestionInput = {
  questionId: 'vault_deposit_expectation',
  flow: 'Vault',
  prompt:
    "Before depositing into the vault, what did you expect to happen to your funds, when and how you'd get them back?",
}

/** Withdraw → withdraw_privacy_check */
export const TESTING_FLOW_QUESTION_WITHDRAW_PRIVACY: ShowFlowQuestionInput = {
  questionId: 'withdraw_privacy_check',
  flow: 'Withdraw',
  prompt:
    'Withdrawing sends funds to your public wallet, this transaction is visible on-chain, same as sending to any external wallet. Is that what you expected, or did it feel more private than that?',
}

/** Request → request_flow_comprehension */
export const TESTING_FLOW_QUESTION_REQUEST_COMPREHENSION: ShowFlowQuestionInput = {
  questionId: 'request_flow_comprehension',
  flow: 'Request',
  prompt:
    'You just created a request link. In your own words, what happens next, who can use it, and what do they need to do?',
}

export const TESTING_TOAST_AUTO_DISMISS_MS = 15_000

export const TESTING_OPEN_FEEDBACK_PROMPT =
  'Anything confusing, broken, or worth telling us?'

/** Window key for live console inspection during testing. */
export const TESTING_SESSION_WINDOW_KEY = '__ARMADA_TESTING_SESSION__'

/**
 * Button accessible-name patterns treated as primary actions for click logging.
 * Dumb substring match — intentional for this research pass.
 */
export const TESTING_PRIMARY_ACTION_PATTERNS = [
  /\bdeposit\b/i,
  /\bsend\b/i,
  /\bwithdraw\b/i,
  /\bearn\b/i,
] as const

/** @deprecated Use TESTING_FLOW_QUESTION_SHIELD_EXPECTATION */
export const TESTING_FLOW_QUESTION_SHIELD_DEPOSIT = TESTING_FLOW_QUESTION_SHIELD_EXPECTATION

/** @deprecated Use testingFlowQuestionSendPrivacyCertainty */
export const testingFlowQuestionPrivateVsPublic = testingFlowQuestionSendPrivacyCertainty
