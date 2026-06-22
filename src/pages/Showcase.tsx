import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { IconButton } from '@/components/IconButton'
import { SendButton } from '@/components/SendButton'
import styles from './Showcase.module.css'

const sampleIcon = <PlusIcon className={styles.showcaseIcon} aria-hidden />

export function Showcase() {
  const [ghostActive, setGhostActive] = useState(false)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={`armada-text-display-md ${styles.title}`}>Armada App — Showcase</h1>
        <p className={`armada-text-ui-body-sm ${styles.subtitle}`}>
          Component gallery for armada-app primitives.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="icon-button-heading">
        <h2 id="icon-button-heading" className={`armada-text-ui-label-tag ${styles.eyebrow}`}>
          IconButton
        </h2>

        <p className={`armada-text-ui-label-sm ${styles.subEyebrow}`}>Variants</p>
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

        <p className={`armada-text-ui-label-sm ${styles.subEyebrow}`}>
          Disabled (ghost toggles active on click)
        </p>
        <div className={styles.row}>
          <IconButton variant="solid" icon={sampleIcon} aria-label="Solid disabled" disabled />
          <IconButton variant="gradient" icon={sampleIcon} aria-label="Gradient disabled" disabled />
          <IconButton variant="ghost" icon={sampleIcon} aria-label="Ghost disabled" disabled />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="send-button-heading">
        <h2 id="send-button-heading" className={`armada-text-ui-label-tag ${styles.eyebrow}`}>
          SendButton
        </h2>

        <p className={`armada-text-ui-label-sm ${styles.subEyebrow}`}>Variants</p>
        <div className={styles.row}>
          <SendButton variant="gradient" onClick={() => undefined} />
          <SendButton variant="solid" onClick={() => undefined} />
        </div>

        <p className={`armada-text-ui-label-sm ${styles.subEyebrow}`}>Disabled</p>
        <div className={styles.row}>
          <SendButton variant="gradient" disabled />
          <SendButton variant="solid" disabled />
        </div>
      </section>
    </div>
  )
}
