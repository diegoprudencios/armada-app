import { useRef } from 'react'
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { BottomSheet, afterBottomSheetHandoff } from '@/components/BottomSheet'
import chooserStyles from './RequestChooserSheet.module.css'

export interface EarnChooserSheetProps {
  open: boolean
  onClose: () => void
  onAdd: () => void
  onWithdraw: () => void
}

export function EarnChooserSheet({ open, onClose, onAdd, onWithdraw }: EarnChooserSheetProps) {
  const intentRef = useRef<'close' | 'add' | 'withdraw' | null>(null)

  function handleClose() {
    intentRef.current = 'close'
    onClose()
  }

  function handleExited() {
    const intent = intentRef.current
    intentRef.current = null
    afterBottomSheetHandoff(() => {
      if (intent === 'add') onAdd()
      if (intent === 'withdraw') onWithdraw()
    })
  }

  function handleAdd() {
    intentRef.current = 'add'
    onClose()
  }

  function handleWithdraw() {
    intentRef.current = 'withdraw'
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      onExited={handleExited}
      title="Earn"
      ariaLabel="Earn"
    >
      <div className={chooserStyles.list} role="menu">
        <button
          type="button"
          className={chooserStyles.item}
          role="menuitem"
          onClick={handleAdd}
          data-testing-click="vault_deposit_choose_button"
        >
          <span className={chooserStyles.itemLead}>
            <span className={chooserStyles.iconBadge}>
              <ArrowDownTrayIcon className={chooserStyles.icon} strokeWidth={1.5} aria-hidden />
            </span>
            <span className={chooserStyles.label}>Add more to the vault</span>
          </span>
        </button>
        <button
          type="button"
          className={chooserStyles.item}
          role="menuitem"
          onClick={handleWithdraw}
          data-testing-click="vault_withdraw_choose_button"
        >
          <span className={chooserStyles.itemLead}>
            <span className={chooserStyles.iconBadge}>
              <ArrowUpTrayIcon className={chooserStyles.icon} strokeWidth={1.5} aria-hidden />
            </span>
            <span className={chooserStyles.label}>Withdraw from the vault</span>
          </span>
        </button>
      </div>
    </BottomSheet>
  )
}
