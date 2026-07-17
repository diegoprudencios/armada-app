import { useEffect, useState, type ReactNode } from 'react'
import { DepositProcessingStepper } from '@/components/DepositProcessingStepper'
import { EarnProcessingStepper } from '@/components/EarnProcessingStepper'
import { ModalShell, modalStepShell } from '@/components/ModalShell'
import {
  TRANSACTION_PROGRESS_VARIANTS,
  type TransactionProgressVariant,
} from '@/components/TransactionProgressDisclosure'
import { SendProcessingStepper } from '@/components/SendProcessingStepper'
import { DEPOSIT_PROGRESS_STEPS } from '@/pages/depositFlowConstants'
import { EARN_PROGRESS_STEPS } from '@/pages/earnFlowConstants'
import { DEMO_0X_RECIPIENT, DEMO_ZK_RECIPIENT, SEND_PROGRESS_STEPS } from '@/pages/sendFlowConstants'
import overlayStyles from '@/components/FlowModalOverlay/FlowModalOverlay.module.css'
import styles from './TxProcessingDevPage.module.css'

const STAGE_COUNT = 3
const PANEL_MINIMIZED_KEY = 'armada-tx-processing-dev-panel-minimized'

type DevFlowId = 'deposit' | 'send' | 'send-external' | 'withdraw' | 'earn-add' | 'earn-withdraw'

interface DevFlowConfig {
  id: DevFlowId
  label: string
  flowLabel: string
  steps: readonly string[]
  currentStep: number
  renderStepper: (
    stage: number,
    progressVariant: TransactionProgressVariant,
    completed: boolean,
  ) => ReactNode
}

const DEV_FLOWS: ReadonlyArray<DevFlowConfig> = [
  {
    id: 'deposit',
    label: 'Deposit',
    flowLabel: 'Deposit',
    steps: DEPOSIT_PROGRESS_STEPS,
    currentStep: 4,
    renderStepper: (stage, progressVariant, completed) => (
      <DepositProcessingStepper
        activeStageIndex={stage}
        completed={completed}
        progressVariant={progressVariant}
      />
    ),
  },
  {
    id: 'send',
    label: 'Send · Private',
    flowLabel: 'Send',
    steps: SEND_PROGRESS_STEPS,
    currentStep: 4,
    renderStepper: (stage, progressVariant, completed) => (
      <SendProcessingStepper
        activeStageIndex={stage}
        completed={completed}
        variant="send"
        recipient={DEMO_ZK_RECIPIENT}
        progressVariant={progressVariant}
      />
    ),
  },
  {
    id: 'send-external',
    label: 'Send · External',
    flowLabel: 'Send',
    steps: SEND_PROGRESS_STEPS,
    currentStep: 4,
    renderStepper: (stage, progressVariant, completed) => (
      <SendProcessingStepper
        activeStageIndex={stage}
        completed={completed}
        variant="send"
        recipient={DEMO_0X_RECIPIENT}
        progressVariant={progressVariant}
      />
    ),
  },
  {
    id: 'withdraw',
    label: 'Withdraw',
    flowLabel: 'Withdraw',
    steps: SEND_PROGRESS_STEPS,
    currentStep: 4,
    renderStepper: (stage, progressVariant, completed) => (
      <SendProcessingStepper
        activeStageIndex={stage}
        completed={completed}
        variant="withdraw"
        progressVariant={progressVariant}
      />
    ),
  },
  {
    id: 'earn-add',
    label: 'Earn · Add',
    flowLabel: 'Earn',
    steps: EARN_PROGRESS_STEPS,
    currentStep: 3,
    renderStepper: (stage, progressVariant, completed) => (
      <EarnProcessingStepper
        tab="add"
        activeStageIndex={stage}
        completed={completed}
        progressVariant={progressVariant}
      />
    ),
  },
  {
    id: 'earn-withdraw',
    label: 'Earn · Withdraw',
    flowLabel: 'Earn',
    steps: EARN_PROGRESS_STEPS,
    currentStep: 3,
    renderStepper: (stage, progressVariant, completed) => (
      <EarnProcessingStepper
        tab="withdraw"
        activeStageIndex={stage}
        completed={completed}
        progressVariant={progressVariant}
      />
    ),
  },
]

function isDevFlowId(value: string | null): value is DevFlowId {
  return DEV_FLOWS.some((flow) => flow.id === value)
}

function isProgressVariant(value: string | null): value is TransactionProgressVariant {
  return TRANSACTION_PROGRESS_VARIANTS.some((variant) => variant.id === value)
}

function readPanelMinimized(): boolean {
  try {
    return window.sessionStorage.getItem(PANEL_MINIMIZED_KEY) === '1'
  } catch {
    return false
  }
}

function writePanelMinimized(minimized: boolean): void {
  try {
    window.sessionStorage.setItem(PANEL_MINIMIZED_KEY, minimized ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function parseDevParams(): {
  flow: DevFlowId
  stage: number
  completed: boolean
  progressVariant: TransactionProgressVariant
} {
  const params = new URLSearchParams(window.location.search)
  const flowParam = params.get('flow')
  const variantParam = params.get('variant')
  const stageParam = Number(params.get('stage') ?? 0)
  const completed = params.get('completed') === '1'

  return {
    flow: isDevFlowId(flowParam) ? flowParam : 'deposit',
    progressVariant: isProgressVariant(variantParam) ? variantParam : 'timeline',
    completed,
    stage: completed
      ? STAGE_COUNT - 1
      : Number.isFinite(stageParam)
        ? Math.min(STAGE_COUNT - 1, Math.max(0, stageParam))
        : 0,
  }
}

export function TxProcessingDevPage() {
  const [initial] = useState(parseDevParams)
  const [flowId, setFlowId] = useState<DevFlowId>(initial.flow)
  const [stage, setStage] = useState(initial.stage)
  const [completed, setCompleted] = useState(initial.completed)
  const [progressVariant, setProgressVariant] = useState<TransactionProgressVariant>(
    initial.progressVariant,
  )
  const [panelMinimized, setPanelMinimized] = useState(readPanelMinimized)

  const flow = DEV_FLOWS.find((item) => item.id === flowId) ?? DEV_FLOWS[0]
  const activeVariant =
    TRANSACTION_PROGRESS_VARIANTS.find((variant) => variant.id === progressVariant) ??
    TRANSACTION_PROGRESS_VARIANTS[0]

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('flow', flowId)
    url.searchParams.set('stage', String(stage))
    url.searchParams.set('completed', completed ? '1' : '0')
    url.searchParams.set('variant', progressVariant)
    window.history.replaceState({}, '', url)
  }, [flowId, stage, completed, progressVariant])

  function togglePanelMinimized() {
    setPanelMinimized((current) => {
      const next = !current
      writePanelMinimized(next)
      return next
    })
  }

  const toolbarClassName = [
    styles.toolbar,
    panelMinimized ? styles.toolbarMinimized : '',
  ]
    .filter(Boolean)
    .join(' ')

  const panelSummary = completed
    ? `${flow.label} · ${activeVariant.label} · Completed`
    : `${flow.label} · ${activeVariant.label} · Stage ${stage + 1}`

  return (
    <div className={overlayStyles.overlay} role="presentation">
      <ModalShell
        steps={[...flow.steps]}
        currentStep={flow.currentStep}
        flowLabel={flow.flowLabel}
        onClose={() => undefined}
      >
        <div key={progressVariant} className={modalStepShell}>
          {flow.renderStepper(stage, progressVariant, completed)}
        </div>
      </ModalShell>

      <aside className={toolbarClassName} aria-label="Processing screen dev controls">
        <div className={styles.toolbarHeader}>
          <p className={styles.toolbarLabel}>Dev — TX processing</p>
          <button
            type="button"
            className={styles.minimizeButton}
            aria-expanded={!panelMinimized}
            aria-label={panelMinimized ? 'Expand dev controls' : 'Minimize dev controls'}
            onClick={togglePanelMinimized}
          >
            {panelMinimized ? 'Expand' : 'Minimize'}
          </button>
        </div>

        {panelMinimized ? (
          <button
            type="button"
            className={styles.minimizedSummary}
            onClick={togglePanelMinimized}
          >
            {panelSummary}
          </button>
        ) : (
          <>
            <div className={styles.controlGroup}>
          <span className={styles.controlCaption}>Progress design</span>
          <div className={styles.pillRow}>
            {TRANSACTION_PROGRESS_VARIANTS.map((variant) => (
              <button
                key={variant.id}
                type="button"
                className={[styles.pill, variant.id === progressVariant && styles.pillActive]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={variant.id === progressVariant}
                onClick={() => setProgressVariant(variant.id)}
              >
                {variant.label}
              </button>
            ))}
          </div>
          <p className={styles.controlHint}>{activeVariant.description}</p>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.controlCaption}>Flow</span>
          <div className={styles.pillRow}>
            {DEV_FLOWS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={[styles.pill, item.id === flowId && styles.pillActive]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={item.id === flowId}
                onClick={() => setFlowId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.controlCaption}>Stage</span>
          <div className={styles.pillRow}>
            {Array.from({ length: STAGE_COUNT }, (_, index) => (
              <button
                key={index}
                type="button"
                className={[
                  styles.pill,
                  !completed && index === stage && styles.pillActive,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={!completed && index === stage}
                onClick={() => {
                  setCompleted(false)
                  setStage(index)
                }}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              className={[styles.pill, completed && styles.pillActive].filter(Boolean).join(' ')}
              aria-pressed={completed}
              onClick={() => {
                setCompleted(true)
                setStage(STAGE_COUNT - 1)
              }}
            >
              Done
            </button>
          </div>
        </div>
          </>
        )}
      </aside>
    </div>
  )
}
