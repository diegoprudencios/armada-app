import { useEffect, useId, useState, type KeyboardEvent } from 'react'

export interface UseListboxKeyboardOptions<T extends string> {
  open: boolean
  options: readonly T[]
  value: T
  onOpenChange: (open: boolean) => void
  onSelect: (value: T) => void
}

export function useListboxKeyboard<T extends string>({
  open,
  options,
  value,
  onOpenChange,
  onSelect,
}: UseListboxKeyboardOptions<T>) {
  const optionIdPrefix = useId()
  const [highlightIndex, setHighlightIndex] = useState(0)

  useEffect(() => {
    if (!open) return
    const selectedIndex = options.indexOf(value)
    setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0)
  }, [open, options, value])

  function getOptionId(index: number) {
    return `${optionIdPrefix}-opt-${index}`
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (open) return

    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault()
      onOpenChange(true)
    }
  }

  function handleListboxKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (!open || options.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightIndex((index) => (index + 1) % options.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightIndex((index) => (index - 1 + options.length) % options.length)
        break
      case 'Home':
        event.preventDefault()
        setHighlightIndex(0)
        break
      case 'End':
        event.preventDefault()
        setHighlightIndex(options.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onSelect(options[highlightIndex])
        onOpenChange(false)
        break
      case 'Escape':
        event.preventDefault()
        onOpenChange(false)
        break
      case 'Tab':
        onOpenChange(false)
        break
    }
  }

  return {
    highlightIndex,
    getOptionId,
    activeDescendantId: open ? getOptionId(highlightIndex) : undefined,
    handleTriggerKeyDown,
    handleListboxKeyDown,
  }
}
