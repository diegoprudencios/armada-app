import { earnProcessingTitle, type EarnTab } from '@/pages/earnFlowConstants'
import type { SendProcessingCopyMode } from '@/pages/sendFlowConstants'

export interface TxProgressStage {
  id: string
  label: string
  subtitle: string
  /** Shown on the final step once the whole flow has completed. */
  completedLabel?: string
}

export const DEPOSIT_PROCESSING_STAGES: ReadonlyArray<TxProgressStage> = [
  {
    id: 'build-proof',
    label: 'Preparing transaction',
    subtitle: 'Building zero-knowledge proof',
  },
  {
    id: 'submit-relayer',
    label: 'Submitting transaction',
    subtitle: 'Relaying privately to hub',
  },
  {
    id: 'hub-confirmed',
    label: 'Shielding',
    subtitle: 'Confirming on chain',
    completedLabel: 'Shielded',
  },
]

export function sendProcessingStages(mode: SendProcessingCopyMode): ReadonlyArray<TxProgressStage> {
  const finalStageByMode: Record<
    SendProcessingCopyMode,
    Pick<TxProgressStage, 'label' | 'subtitle' | 'completedLabel'>
  > = {
    private: {
      label: 'Sending',
      subtitle: 'Delivering privately to recipient',
      completedLabel: 'Sent',
    },
    external: {
      label: 'Unshielding',
      subtitle: 'Sending USDC to external wallet',
      completedLabel: 'Sent',
    },
    withdraw: {
      label: 'Unshielding',
      subtitle: 'Returning USDC to your wallet',
      completedLabel: 'Unshielded',
    },
  }

  const relaySubtitle =
    mode === 'private' ? 'Relaying privately to recipient' : 'Relaying to public chain'

  const finalStage = finalStageByMode[mode]

  return [
    {
      id: 'build-proof',
      label: 'Preparing transaction',
      subtitle: 'Building zero-knowledge proof',
    },
    {
      id: 'submit-relayer',
      label: 'Submitting transaction',
      subtitle: relaySubtitle,
    },
    {
      id: 'sent',
      label: finalStage.label,
      subtitle: finalStage.subtitle,
      completedLabel: finalStage.completedLabel,
    },
  ]
}

export function earnProcessingStages(tab: EarnTab): ReadonlyArray<TxProgressStage> {
  const finalLabel = tab === 'add' ? 'Adding to shielded vault' : 'Withdrawing'
  const finalCompletedLabel = tab === 'add' ? 'Earning' : 'Returned to balance'
  const finalSubtitle =
    tab === 'add' ? 'USDC is entering the shielded vault' : 'USDC is returning to your balance'

  return [
    {
      id: 'build-proof',
      label: 'Preparing transaction',
      subtitle: 'Building zero-knowledge proof',
    },
    {
      id: 'submit-relayer',
      label: 'Submitting privately',
      subtitle: 'Relaying to shielded vault',
    },
    {
      id: 'hub-confirmed',
      label: finalLabel,
      subtitle: finalSubtitle,
      completedLabel: finalCompletedLabel,
    },
  ]
}

export const TX_PROGRESS_CLOSE_SUBTITLE_LINES = [
  'You can close this window.',
  "We'll keep processing in the background.",
] as const

export interface TxProgressCardCopy {
  /** Sentence case in copy; used for accessible name. */
  tag: string
  title: string
  titleBreakAfter?: string
  /** Explicit line breaks (takes precedence over `titleBreakAfter`). */
  titleLines?: readonly string[]
  subtitle: string
  subtitleLines?: readonly string[]
}

export const DEPOSIT_PROGRESS_CARD_COPY: TxProgressCardCopy = {
  tag: 'Shield in progress',
  title: 'Your USDC is being shielded',
  titleLines: ['Your USDC is', 'being shielded'],
  subtitle: TX_PROGRESS_CLOSE_SUBTITLE_LINES.join(' '),
  subtitleLines: TX_PROGRESS_CLOSE_SUBTITLE_LINES,
}

export function sendProgressCardCopy(mode: SendProcessingCopyMode): TxProgressCardCopy {
  if (mode === 'withdraw') {
    return {
      tag: 'Unshield in progress',
      title: 'Unshielding your USDC',
      titleLines: ['Unshielding your', 'USDC'],
      subtitle: TX_PROGRESS_CLOSE_SUBTITLE_LINES.join(' '),
      subtitleLines: TX_PROGRESS_CLOSE_SUBTITLE_LINES,
    }
  }

  if (mode === 'private') {
    return {
      tag: 'Private send in progress',
      title: 'Sending your USDC privately',
      titleBreakAfter: 'your',
      subtitle: TX_PROGRESS_CLOSE_SUBTITLE_LINES.join(' '),
      subtitleLines: TX_PROGRESS_CLOSE_SUBTITLE_LINES,
    }
  }

  return {
    tag: 'Send in progress',
    title: 'Unshielding and sending your USDC',
    titleLines: ['Unshielding and sending', 'your USDC'],
    subtitle: TX_PROGRESS_CLOSE_SUBTITLE_LINES.join(' '),
    subtitleLines: TX_PROGRESS_CLOSE_SUBTITLE_LINES,
  }
}

export function earnProgressCardCopy(tab: EarnTab): TxProgressCardCopy {
  if (tab === 'add') {
    return {
      tag: earnProcessingTitle('add'),
      title: 'Sending USDC to shielded vault',
      titleBreakAfter: 'USDC',
      subtitle: TX_PROGRESS_CLOSE_SUBTITLE_LINES.join(' '),
      subtitleLines: TX_PROGRESS_CLOSE_SUBTITLE_LINES,
    }
  }

  return {
    tag: earnProcessingTitle('withdraw'),
    title: 'Withdraw from shielded vault in progress',
    subtitle: TX_PROGRESS_CLOSE_SUBTITLE_LINES.join(' '),
    subtitleLines: TX_PROGRESS_CLOSE_SUBTITLE_LINES,
  }
}

export function resolveStageLabel(
  stage: TxProgressStage,
  index: number,
  stageCount: number,
  completed: boolean,
): string {
  if (completed && index === stageCount - 1 && stage.completedLabel) {
    return stage.completedLabel
  }

  return stage.label
}
