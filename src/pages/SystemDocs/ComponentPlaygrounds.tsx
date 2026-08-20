import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button, type ButtonSize, type ButtonVariant } from '@/components/Button'
import { IconButton, type IconButtonSize, type IconButtonVariant } from '@/components/IconButton'
import { Tag, type TagDot } from '@/components/Tag'
import { SegmentedControl, type SegmentedControlLayout, type SegmentedControlSize, type SegmentedControlSurface } from '@/components/SegmentedControl'
import { Steps } from '@/components/Steps'
import { ThemeToggle } from '@/components/ThemeToggle'
import { TokenBadge } from '@/components/TokenBadge'
import { Tooltip } from '@/components/Tooltip'
import {
  BalanceActionButton,
  type BalanceActionButtonLayout,
  type BalanceActionButtonSurface,
  type BalanceActionButtonVariant,
} from '@/components/BalanceActionButton/BalanceActionButton'
import styles from './SystemDocs.module.css'

const BUTTON_VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'gradient', 'ink']
const BUTTON_SIZES: ButtonSize[] = ['sm', 'md', 'lg']
const ICON_VARIANTS: IconButtonVariant[] = ['solid', 'gradient', 'ghost', 'secondary', 'frosted', 'tinted']
const ICON_SIZES: IconButtonSize[] = ['sm', 'md', 'lg']
const TAG_DOTS: TagDot[] = ['active', 'warning', 'error', 'neutral', 'lavender']
const SEG_SIZES: SegmentedControlSize[] = ['sm', 'md']
const SEG_LAYOUTS: SegmentedControlLayout[] = ['equal', 'scroll']
const SEG_SURFACES: SegmentedControlSurface[] = ['frost', 'raised']
const STEP_STATUS = ['default', 'error', 'confirmed'] as const
const BAB_VARIANTS: BalanceActionButtonVariant[] = ['primary', 'subtle']
const BAB_LAYOUTS: BalanceActionButtonLayout[] = ['circle', 'compact']
const BAB_SURFACES: BalanceActionButtonSurface[] = ['frost', 'tint']

function CopyButton({ code }: { code: string }) {
  return (
    <div className={styles.copyRow}>
      <button
        type="button"
        className={styles.copyBtn}
        onClick={() => void navigator.clipboard.writeText(code)}
      >
        Copy code
      </button>
    </div>
  )
}

export function ComponentPlayground({ name }: { name: string }) {
  const [seg, setSeg] = useState('a')

  if (name === 'Button') {
    return (
      <>
        {BUTTON_VARIANTS.flatMap((variant) =>
          BUTTON_SIZES.map((size) => (
            <div key={`${variant}-${size}`} className={styles.playground}>
              <CopyButton code={`<Button variant="${variant}" size="${size}" label="Button" />`} />
              <Button variant={variant} size={size} label="Button" />
              <Button variant={variant} size={size} label="Disabled" disabled />
            </div>
          )),
        )}
      </>
    )
  }

  if (name === 'IconButton') {
    return (
      <>
        {ICON_VARIANTS.flatMap((variant) =>
          ICON_SIZES.map((size) => (
            <div key={`${variant}-${size}`} className={styles.playground}>
              <CopyButton
                code={`<IconButton variant="${variant}" size="${size}" aria-label="Add" icon={<PlusIcon />} />`}
              />
              <IconButton variant={variant} size={size} aria-label="Add" icon={<PlusIcon strokeWidth={1.5} />} />
              <IconButton
                variant={variant}
                size={size}
                aria-label="Add disabled"
                icon={<PlusIcon strokeWidth={1.5} />}
                disabled
              />
            </div>
          )),
        )}
      </>
    )
  }

  if (name === 'Tag') {
    return (
      <div className={styles.playground}>
        <Tag label="Default" />
        {TAG_DOTS.map((dot) => (
          <span key={dot}>
            <CopyButton code={`<Tag label="${dot}" dot="${dot}" />`} />
            <Tag label={dot} dot={dot} />
          </span>
        ))}
      </div>
    )
  }

  if (name === 'SegmentedControl') {
    const options = [
      { id: 'a', label: 'One' },
      { id: 'b', label: 'Two' },
      { id: 'c', label: 'Three' },
    ]
    return (
      <>
        {SEG_SURFACES.flatMap((surface) =>
          SEG_SIZES.flatMap((size) =>
            SEG_LAYOUTS.map((layout) => (
              <div key={`${surface}-${size}-${layout}`} className={styles.playground}>
                <CopyButton
                  code={`<SegmentedControl size="${size}" layout="${layout}" surface="${surface}" options={…} />`}
                />
                <SegmentedControl
                  options={options}
                  value={seg}
                  onChange={setSeg}
                  size={size}
                  layout={layout}
                  surface={surface}
                  aria-label={`Demo ${surface} ${size} ${layout}`}
                />
              </div>
            )),
          ),
        )}
      </>
    )
  }

  if (name === 'Steps') {
    return (
      <>
        {STEP_STATUS.map((status) => (
          <div key={status} className={styles.playground}>
            <CopyButton code={`<Steps steps={['A','B','C']} currentStep={2} status="${status}" />`} />
            <Steps steps={['Connect', 'Commit', 'Confirm']} currentStep={2} status={status} />
          </div>
        ))}
      </>
    )
  }

  if (name === 'ThemeToggle') {
    return (
      <div className={styles.playground}>
        <CopyButton code="<ThemeToggle />" />
        <ThemeToggle />
      </div>
    )
  }

  if (name === 'TokenBadge') {
    return (
      <div className={styles.playground}>
        <CopyButton code="<TokenBadge />" />
        <TokenBadge />
      </div>
    )
  }

  if (name === 'Tooltip') {
    return (
      <div className={styles.playground}>
        <CopyButton code={`<Tooltip variant="centered" content="Hint">…</Tooltip>`} />
        <Tooltip variant="centered" content="Hint">
          <Button label="Hover" showIcon={false} />
        </Tooltip>
        <Tooltip variant="rich" title="Title" description="Description">
          <Button label="Rich" showIcon={false} variant="secondary" />
        </Tooltip>
        <Tooltip variant="action" content="Action hint">
          <Button label="Action" showIcon={false} variant="ghost" />
        </Tooltip>
      </div>
    )
  }

  if (name === 'BalanceActionButton') {
    return (
      <>
        {BAB_SURFACES.flatMap((surface) =>
          BAB_VARIANTS.flatMap((variant) =>
            BAB_LAYOUTS.map((layout) => (
              <div key={`${surface}-${variant}-${layout}`} className={styles.playground}>
                <CopyButton
                  code={`<BalanceActionButton label="Shield" variant="${variant}" layout="${layout}" surface="${surface}" />`}
                />
                <BalanceActionButton
                  label="Shield"
                  icon={<PlusIcon strokeWidth={1.5} />}
                  variant={variant}
                  layout={layout}
                  surface={surface}
                />
                <BalanceActionButton
                  label="Shield"
                  icon={<PlusIcon strokeWidth={1.5} />}
                  variant={variant}
                  layout={layout}
                  surface={surface}
                  disabled
                />
              </div>
            )),
          ),
        )}
      </>
    )
  }

  return (
    <p className={styles.note}>
      Live playground not mounted: this component needs flow/demo context. Path is listed; do not
      invent a fake API.
    </p>
  )
}
