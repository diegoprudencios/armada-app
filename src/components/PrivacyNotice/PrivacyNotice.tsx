import { GlobeAltIcon } from '@heroicons/react/24/outline'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import styles from './PrivacyNotice.module.css'

export interface PrivacyNoticeProps {
  tone?: 'private' | 'public'
  title: string
  body: string
}

export function PrivacyNotice({ tone = 'private', title, body }: PrivacyNoticeProps) {
  const isPrivate = tone === 'private'

  return (
    <div className={styles.notice} role="note">
      <span
        className={[styles.icon, isPrivate ? styles.iconPrivate : styles.iconPublic].join(' ')}
        aria-hidden
      >
        {isPrivate ? (
          <ArmadaLogo variant="mark" markTone="deep" className={styles.mark} />
        ) : (
          <GlobeAltIcon className={styles.mark} strokeWidth={1.75} />
        )}
      </span>
      <div className={styles.copy}>
        <p className={styles.title}>{title}</p>
        <p className={styles.body}>{body}</p>
      </div>
    </div>
  )
}
