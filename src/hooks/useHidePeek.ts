import type { HTMLAttributes } from 'react'

export function hidePeekEventHandlers(
  enabled: boolean,
  reveal: () => void,
  hide: () => void,
  isMobile: boolean,
): HTMLAttributes<HTMLElement> {
  if (!enabled) return {}

  if (isMobile) {
    return {
      onPointerDown: reveal,
      onPointerUp: hide,
      onPointerCancel: hide,
    }
  }

  return {
    onMouseEnter: reveal,
    onMouseLeave: hide,
    onFocus: reveal,
    onBlur: hide,
  }
}
