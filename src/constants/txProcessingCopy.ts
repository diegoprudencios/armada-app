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
    label: 'Depositing',
    subtitle: 'Confirming on chain',
    completedLabel: 'Deposited',
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
      label: 'Withdrawing',
      subtitle: 'Returning USDC to your wallet',
      completedLabel: 'Withdrawn',
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
  const finalLabel = tab === 'add' ? 'Adding to vault' : 'Withdrawing'
  const finalCompletedLabel = tab === 'add' ? 'Earning' : 'Returned to balance'
  const finalSubtitle =
    tab === 'add' ? 'Funds are entering the yield vault' : 'Funds are returning to your balance'

  return [
    {
      id: 'build-proof',
      label: 'Preparing transaction',
      subtitle: 'Building zero-knowledge proof',
    },
    {
      id: 'submit-relayer',
      label: 'Submitting privately',
      subtitle: 'Relaying to vault',
    },
    {
      id: 'hub-confirmed',
      label: finalLabel,
      subtitle: finalSubtitle,
      completedLabel: finalCompletedLabel,
    },
  ]
}

export interface TxProgressCardCopy {
  /** Sentence case in copy; rendered uppercase in the card. */
  tag: string
  title: string
  titleBreakAfter?: string
  subtitle: string
}

export const DEPOSIT_PROGRESS_CARD_COPY: TxProgressCardCopy = {
  tag: 'Deposit in progress',
  title: 'Your assets are being shielded',
  titleBreakAfter: 'are',
  subtitle: 'You are almost ready to move funds privately.',
}

export function sendProgressCardCopy(mode: SendProcessingCopyMode): TxProgressCardCopy {
  if (mode === 'withdraw') {
    return {
      tag: 'Withdrawal in progress',
      title: 'Your withdrawal is in progress',
      subtitle: 'USDC is being sent back to your wallet.',
    }
  }

  if (mode === 'private') {
    return {
      tag: 'Private send in progress',
      title: 'This transfer is fully private',
      titleBreakAfter: 'is',
      subtitle: 'Only you and the recipient can see this payment.',
    }
  }

  return {
    tag: 'Send in progress',
    title: 'Unshielding your USDC',
    subtitle: "This transaction won't be fully private.",
  }
}

export function earnProgressCardCopy(tab: EarnTab): TxProgressCardCopy {
  if (tab === 'add') {
    return {
      tag: earnProcessingTitle('add'),
      title: 'Your funds are entering the vault',
      titleBreakAfter: 'are',
      subtitle: 'USDC is being deposited to start earning yield.',
    }
  }

  return {
    tag: earnProcessingTitle('withdraw'),
    title: 'Your withdrawal is in progress',
    subtitle: 'Funds are returning from the vault to your balance.',
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
