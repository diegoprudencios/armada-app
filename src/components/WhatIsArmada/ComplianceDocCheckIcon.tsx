/**
 * Document 40×50 with dog-ear + 20×20 ink check badge.
 * Badge overhangs the paper by 6px on both the right and bottom.
 * Uses currentColor for document stroke and badge fill; check is white.
 */

/** Paper size (CSS px at scale 1). */
export const COMPLIANCE_DOC_WIDTH = 40
export const COMPLIANCE_DOC_HEIGHT = 50
/** Badge diameter 20×20. */
export const COMPLIANCE_BADGE_R = 10
/** Equal overhang past the paper on the right and bottom. */
export const COMPLIANCE_BADGE_OVERHANG = 6

export const COMPLIANCE_ICON_WIDTH = COMPLIANCE_DOC_WIDTH + COMPLIANCE_BADGE_OVERHANG
export const COMPLIANCE_ICON_HEIGHT = COMPLIANCE_DOC_HEIGHT + COMPLIANCE_BADGE_OVERHANG

const FOLD = 12
const BADGE_CX = COMPLIANCE_DOC_WIDTH + COMPLIANCE_BADGE_OVERHANG - COMPLIANCE_BADGE_R
const BADGE_CY = COMPLIANCE_DOC_HEIGHT + COMPLIANCE_BADGE_OVERHANG - COMPLIANCE_BADGE_R

export function ComplianceDocCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${COMPLIANCE_ICON_WIDTH} ${COMPLIANCE_ICON_HEIGHT}`}
      width={COMPLIANCE_ICON_WIDTH}
      height={COMPLIANCE_ICON_HEIGHT}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Paper 40×50, dog-ear top-right. */}
      <path
        className="docStroke"
        d={`M0.5 0.5 H${COMPLIANCE_DOC_WIDTH - FOLD} L${COMPLIANCE_DOC_WIDTH - 0.5} ${FOLD} V${COMPLIANCE_DOC_HEIGHT - 0.5} H0.5 Z`}
        stroke="currentColor"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <path
        className="docStroke"
        d={`M${COMPLIANCE_DOC_WIDTH - FOLD} 0.5 V${FOLD} H${COMPLIANCE_DOC_WIDTH - 0.5}`}
        stroke="currentColor"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      {/* Text lines inside the paper. */}
      <path
        className="docStroke"
        d={`M8 18 H${COMPLIANCE_DOC_WIDTH - 8} M8 24 H${COMPLIANCE_DOC_WIDTH - 8} M8 30 H${COMPLIANCE_DOC_WIDTH - 14}`}
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
      />
      <circle cx={BADGE_CX} cy={BADGE_CY} r={COMPLIANCE_BADGE_R} fill="currentColor" />
      <path
        className="checkStroke"
        d={`M${BADGE_CX - 4} ${BADGE_CY + 0.25} L${BADGE_CX - 1} ${BADGE_CY + 3.25} L${BADGE_CX + 4.75} ${BADGE_CY - 3}`}
        stroke="#ffffff"
        strokeWidth={1.35}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
