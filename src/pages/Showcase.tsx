import { useState, type ReactNode } from 'react'
import {
  WalletMetamask,
  WalletPhantom,
  WalletWalletConnect,
} from '@web3icons/react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { BalanceCard } from '@/components/BalanceCard'
import { RecentActivityList } from '@/components/RecentActivityList'
import { Button } from '@/components/Button'
import { DepositProcessingStepper } from '@/components/DepositProcessingStepper'
import { DepositReviewSummary } from '@/components/DepositReviewSummary'
import { DepositTooltip } from '@/components/DepositTooltip'
import { IconButton } from '@/components/IconButton'
import { SendButton } from '@/components/SendButton'
import { StatusChip } from '@/components/StatusChip'
import { Steps } from '@/components/Steps'
import { TechnicalDetailsDisclosure } from '@/components/TechnicalDetailsDisclosure'
import { TokenBadge } from '@/components/TokenBadge'
import { Tooltip } from '@/components/Tooltip'
import { WalletButton } from '@/components/WalletButton'
import WalletItem from '@/components/WalletItem/WalletItem'
import { WalletConfirmList } from '@/components/WalletConfirmList'
import { WalletPillMenu } from '@/components/WalletPillMenu'
import { WalletProviderIcon } from '@/components/WalletPillMenu/WalletPillMenu'
import {
  DEMO_ARMADA_ADDRESS,
  DEMO_WALLET_ADDRESS,
} from '@/pages/depositFlowConstants'
import styles from './Showcase.module.css'

const DEPOSIT_STEPS = ['Amount', 'Review', 'Wallet', 'Confirm']
const sampleIcon = <PlusIcon className={styles.showcaseIcon} aria-hidden />

const WALLET_CONFIRM_STEPS = [
  { label: 'Approve 1,000 USDC', status: 'done' as const },
  { label: 'Sign deposit transaction', status: 'loading' as const },
]

type ShowcaseStage = 'dashboard' | 'modal'

interface ShowcaseSectionProps {
  id: string
  title: string
  description?: string
  stage?: ShowcaseStage
  children: ReactNode
}

function PreviewStage({
  variant,
  children,
}: {
  variant: ShowcaseStage
  children: ReactNode
}) {
  const className = [
    styles.previewStage,
    variant === 'modal' ? styles.previewStageModal : styles.previewStageDashboard,
  ].join(' ')

  return (
    <div className={className}>
      <span className={styles.previewStageLabel}>
        {variant === 'modal' ? 'Deposit modal surface' : 'Dashboard surface'}
      </span>
      <div className={styles.previewStageContent}>{children}</div>
    </div>
  )
}

function ShowcaseSection({
  id,
  title,
  description,
  stage = 'dashboard',
  children,
}: ShowcaseSectionProps) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <h2 id={id} className={`armada-text-ui-label-tag ${styles.eyebrow}`}>
        {title}
      </h2>
      {description ? (
        <p className={`armada-text-ui-body-sm ${styles.sectionDesc}`}>{description}</p>
      ) : null}
      <PreviewStage variant={stage}>{children}</PreviewStage>
    </section>
  )
}

function SubLabel({ children }: { children: ReactNode }) {
  return <p className={`armada-text-ui-label-sm ${styles.subEyebrow}`}>{children}</p>
}

export function Showcase() {
  const [ghostActive, setGhostActive] = useState(false)
  const [depositStep, setDepositStep] = useState(2)
  const [stepsStatus, setStepsStatus] = useState<'default' | 'confirmed'>('default')
  const [processingStage, setProcessingStage] = useState(1)
  const [balanceLayout, setBalanceLayout] = useState<'default' | 'v2'>('default')
  const [hasDeposit, setHasDeposit] = useState(false)
  const [showVaultPosition, setShowVaultPosition] = useState(false)
  const [activityVisible, setActivityVisible] = useState(false)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={`armada-text-display-md ${styles.title}`}>Armada App — Showcase</h1>
        <p className={`armada-text-ui-body-sm ${styles.subtitle}`}>
          Components used in landing, dashboard, and deposit flows.
        </p>
        <nav className={styles.nav} aria-label="App routes">
          <a className={styles.navLink} href="/">
            Landing
          </a>
          <a className={styles.navLink} href="/dashboard">
            Dashboard
          </a>
          <a className={styles.navLink} href="/deposit">
            Deposit demo
          </a>
        </nav>
      </header>

      <ShowcaseSection id="armada-logo" title="ArmadaLogo">
        <SubLabel>Mark — brand gradient</SubLabel>
        <div className={styles.row}>
          <ArmadaLogo variant="mark" />
          <ArmadaLogo variant="mark" markTone="white" className={styles.logoMarkDeep} />
        </div>
        <SubLabel>Full wordmark</SubLabel>
        <ArmadaLogo variant="full" />
      </ShowcaseSection>

      <ShowcaseSection
        id="button"
        title="Button"
        description="Primary actions in landing, deposit modals, and confirmations."
        stage="modal"
      >
        <SubLabel>Variants — lg (deposit modal)</SubLabel>
        <div className={styles.row}>
          <Button variant="primary" size="lg" label="Primary" showIcon={false} />
          <Button variant="secondary" size="lg" label="Secondary" showIcon={false} />
          <Button variant="ghost" size="lg" label="Ghost" showIcon={false} />
          <Button variant="gradient" size="lg" label="Gradient" showIcon={false} />
        </div>
        <SubLabel>Disabled</SubLabel>
        <div className={styles.row}>
          <Button variant="primary" size="lg" label="Primary" showIcon={false} disabled />
          <Button variant="secondary" size="lg" label="Secondary" showIcon={false} disabled />
        </div>
        <SubLabel>Disabled — keeps enabled colors (deposit CTA)</SubLabel>
        <div className={styles.row}>
          <Button
            variant="primary"
            size="lg"
            label="Input amount"
            showIcon={false}
            disabled
            dimWhenDisabled={false}
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="icon-button" title="IconButton">
        <SubLabel>Variants</SubLabel>
        <div className={styles.row}>
          <IconButton variant="solid" icon={sampleIcon} aria-label="Solid icon button" />
          <IconButton variant="gradient" icon={sampleIcon} aria-label="Gradient icon button" />
          <IconButton variant="ghost" icon={sampleIcon} aria-label="Ghost icon button" />
          <IconButton
            variant="ghost"
            icon={sampleIcon}
            active={ghostActive}
            aria-label="Ghost icon button active"
            onClick={() => setGhostActive((value) => !value)}
          />
        </div>
        <SubLabel>Disabled</SubLabel>
        <div className={styles.row}>
          <IconButton variant="solid" icon={sampleIcon} aria-label="Solid disabled" disabled />
          <IconButton variant="gradient" icon={sampleIcon} aria-label="Gradient disabled" disabled />
          <IconButton variant="ghost" icon={sampleIcon} aria-label="Ghost disabled" disabled />
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="send-button" title="SendButton">
        <div className={styles.row}>
          <SendButton variant="gradient" onClick={() => undefined} />
          <SendButton variant="solid" onClick={() => undefined} />
          <SendButton variant="lavender" onClick={() => undefined} />
        </div>
        <SubLabel>Disabled</SubLabel>
        <div className={styles.row}>
          <SendButton variant="gradient" disabled />
          <SendButton variant="solid" disabled />
          <SendButton variant="lavender" disabled />
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="status-chip" title="StatusChip">
        <div className={styles.row}>
          <StatusChip label="Neutral" variant="neutral" />
          <StatusChip label="Success" variant="success" />
          <StatusChip label="Warning" variant="warning" />
          <StatusChip label="Error" variant="error" />
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="token-badge" title="TokenBadge">
        <div className={styles.row}>
          <TokenBadge size={40} />
          <TokenBadge size={51} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="tooltip" title="Tooltip">
        <div className={styles.row}>
          <Tooltip variant="centered" content="Centered tooltip copy">
            <button type="button" className={styles.tooltipTrigger}>
              Hover — centered
            </button>
          </Tooltip>
          <Tooltip
            variant="rich"
            title="Rich tooltip"
            description="Used for longer guidance in flows."
            bullets={['Bullet one', 'Bullet two']}
          >
            <button type="button" className={styles.tooltipTrigger}>
              Hover — rich
            </button>
          </Tooltip>
          <Tooltip variant="action" content="Action tooltip">
            <button type="button" className={styles.tooltipTrigger}>
              Focus — action
            </button>
          </Tooltip>
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="wallet" title="Wallet">
        <SubLabel>WalletButton</SubLabel>
        <div className={styles.row}>
          <WalletButton label="Connect Wallet" onClick={() => undefined} />
          <WalletButton
            label="0x6545…4534"
            variant="destructive"
            onClick={() => undefined}
          />
        </div>
        <SubLabel>WalletProviderIcon</SubLabel>
        <div className={styles.row}>
          <WalletProviderIcon provider="metamask" size={20} />
          <WalletProviderIcon provider="phantom" size={20} />
          <WalletProviderIcon provider="walletconnect" size={20} />
        </div>
        <SubLabel>WalletItem (connect overlay)</SubLabel>
        <div className={`${styles.stack} ${styles.narrow}`}>
          <WalletItem
            name="MetaMask"
            iconComponent={<WalletMetamask size={24} />}
            onClick={() => undefined}
          />
          <WalletItem
            name="Phantom"
            iconComponent={<WalletPhantom size={24} />}
            onClick={() => undefined}
          />
          <WalletItem
            name="WalletConnect"
            iconComponent={<WalletWalletConnect size={24} />}
            onClick={() => undefined}
          />
        </div>
        <SubLabel>WalletPillMenu (connected)</SubLabel>
        <WalletPillMenu
          displayAddress="0x6545…4534"
          copyAddress={DEMO_WALLET_ADDRESS}
          walletProvider="metamask"
          usdcBalance={123283.23}
          onDisconnect={() => undefined}
        />
      </ShowcaseSection>

      <ShowcaseSection id="steps" title="Steps" stage="modal">
        <div className={styles.stack}>
          <div className={styles.stepControls}>
            {DEPOSIT_STEPS.map((_, index) => (
              <button
                key={index}
                type="button"
                className={styles.stepControl}
                onClick={() => {
                  setStepsStatus('default')
                  setDepositStep(index + 1)
                }}
              >
                Step {index + 1}
              </button>
            ))}
            <button
              type="button"
              className={styles.stepControl}
              onClick={() => {
                setStepsStatus('confirmed')
                setDepositStep(DEPOSIT_STEPS.length)
              }}
            >
              Confirmed
            </button>
          </div>
          <Steps
            steps={DEPOSIT_STEPS}
            currentStep={depositStep}
            flowLabel="Deposit"
            status={stepsStatus}
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="deposit-review" title="DepositReviewSummary" stage="modal">
        <div className={`${styles.stack} ${styles.narrow}`}>
          <DepositReviewSummary
            networkName="Ethereum Sepolia"
            amount={1000}
            feeUsdc={2}
            walletAddress={DEMO_WALLET_ADDRESS}
            walletProvider="metamask"
            armadaAddress={DEMO_ARMADA_ADDRESS}
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="wallet-confirm" title="WalletConfirmList" stage="modal">
        <div className={`${styles.stack} ${styles.narrow}`}>
          <WalletConfirmList steps={WALLET_CONFIRM_STEPS} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="deposit-processing" title="DepositProcessingStepper" stage="modal">
        <div className={styles.stack}>
          <div className={styles.stepControls}>
            {[0, 1, 2].map((stage) => (
              <button
                key={stage}
                type="button"
                className={styles.stepControl}
                onClick={() => setProcessingStage(stage)}
              >
                Stage {stage + 1}
              </button>
            ))}
          </div>
          <div className={styles.narrow}>
            <DepositProcessingStepper
              activeStageIndex={processingStage}
              onCancel={() => undefined}
            />
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="technical-details" title="TechnicalDetailsDisclosure" stage="modal">
        <div className={`${styles.stack} ${styles.narrow}`}>
          <TechnicalDetailsDisclosure>
            <dl className={styles.facts}>
              <div>
                <dt>Record ID</dt>
                <dd>01IKSZMT9MVT3SZ6XQ0ZI9XVFAP</dd>
              </div>
            </dl>
          </TechnicalDetailsDisclosure>
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="deposit-tooltip" title="DepositTooltip">
        <div className={styles.depositTooltipRow}>
          <DepositTooltip variant="default" onDeposit={() => undefined} />
          <DepositTooltip variant="v2" onDeposit={() => undefined} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="balance-card" title="BalanceCard">
        <div className={styles.balanceControls}>
          <button
            type="button"
            className={styles.stepControl}
            onClick={() => setBalanceLayout('default')}
          >
            Default layout
          </button>
          <button
            type="button"
            className={styles.stepControl}
            onClick={() => setBalanceLayout('v2')}
          >
            V2 layout
          </button>
          <button
            type="button"
            className={styles.stepControl}
            onClick={() => setHasDeposit((value) => !value)}
          >
            {hasDeposit ? 'First deposit' : 'Has deposit'}
          </button>
          <button
            type="button"
            className={styles.stepControl}
            onClick={() => setShowVaultPosition((value) => !value)}
          >
            {showVaultPosition ? 'Hide vault' : 'Show vault'}
          </button>
        </div>
        <div className={styles.balanceFrame}>
          <BalanceCard
            balance={123283.23}
            actionLayout={balanceLayout}
            hasCompletedDeposit={hasDeposit}
            vaultBalance={showVaultPosition ? 250 : 0}
            activityVisible={activityVisible}
            onToggleActivity={() => setActivityVisible((value) => !value)}
            onSend={() => undefined}
            onDeposit={() => undefined}
            onRequest={() => undefined}
            onMore={() => undefined}
            onEarn={() => undefined}
          />
          {activityVisible ? <RecentActivityList items={[]} /> : null}
        </div>
      </ShowcaseSection>
    </div>
  )
}
