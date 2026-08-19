# Armada App — code quality audit

Date: 2026-08-19  
Scope: `armada-app` only. No code was changed for this document.

Overall: TypeScript is strict and there is almost no `any`. Demo wallet/session logic is already split into hooks. The main quality issues are **oversized UI files**, **copy-pasted flow/summary screens**, **token exceptions on marketing**, and **unused / drilled props** left after version cleanup.

Risk = chance of visual or flow regressions if you “fix” it, not how bad the code is today.

---

## 1. Components that are too large / do too many things

| File | Lines | What’s wrong | Risk to fix |
|------|------:|--------------|-------------|
| `src/components/PrivacySphere/useThreeScene.ts` | 580 | Three.js scene, camera, fat-lines, USDC traveler, resize, reduced-motion. Not a React component, but the heaviest unit in the app. | **High** — silent visual / WebGL breakage |
| `src/components/AmountInputScreen/AmountInputScreen.tsx` | 549 | Shared amount UI for deposit/send/earn/request/withdraw: keypad vs input, shield layout, fees, max/percent, shake, rolling balance, a11y. Props surface is a kitchen sink (`balanceMode`, `entryMode`, `layout`, slots, fee helpers). | **High** — every money flow uses it |
| `src/components/WhatIsArmada/WhatIsArmada.tsx` | 500 | Marketing section: copy data, scroll-scrub handoff, feature cards, lazy 3D, compliance/cube diagrams. | **Medium** — marketing-only, still scroll-timing sensitive |
| `src/components/SiteHeader/SiteHeader.tsx` | 470 | Desktop mega-menu, mobile drawer, scroll hide/show, Open App CTA. | **Medium** |
| `src/components/WhatIsArmada/FoundationsCubeGrid.tsx` | 460 | Canvas cube grid + scroll IO + hardcoded diagram hex. | **Medium** |
| `src/pages/SendRecipientScreen.tsx` | 457 | Recipient input, clipboard, recent addresses, environment mock, shake, listbox keyboard, validation. | **High** — send/withdraw share patterns |
| `src/pages/RequestModalFlow.tsx` | 445 | Orchestrates request + share + QR + clipboard + step machine. | **High** |
| `src/components/BalanceCard/BalanceCard.tsx` | 400 | Balance reveal, scramble, roll, hide/peek, address copy, vault bar, action row, font-size fitting. | **High** — dashboard identity |
| `src/utils/dashboardActivity.ts` | 377 | Factory + normalize + filters + labels for every activity kind. | **Medium** |
| `src/components/PrivacySphere/PrivacySphereStory.tsx` | 375 | SVG connectors + labels + Three canvas host. | **High** if split from `useThreeScene` |
| `src/components/MarketingHero/MarketingHero.tsx` | 346 | Enter animations, sticky pin, scroll scrub, desktop handoff hook inlined. | **Medium** |
| `src/testingFeedback/useSessionLogger.tsx` | 339 | Session model, toasts, flow questions, window debug hook, persist. Gated off (`TESTING_FEEDBACK_ENABLED = false`) but still compiled. | **Low** — planned replacement |
| `src/pages/DepositModalFlow.tsx` | 325 | Step table, mobile sheet vs desktop modal, search-param entry mode, processing timers. Same shape as send/earn/withdraw. | **High** if you unify all flows at once |
| `src/pages/DashboardOverlays.tsx` | 316 | Renders every modal + connect overlay + injects testing questions into completions. | **Medium** |
| `src/components/BalanceScrambleValue/BalanceScrambleValue.tsx` | 319 | Digit scramble animation. | **Medium** — motion math |
| `src/pages/WithdrawModalFlow.tsx` / `SendModalFlow.tsx` / `EarnModalFlow.tsx` | 300 / 280 / 276 | Parallel copies of deposit’s modal shell pattern. | **High** to merge |
| `src/hooks/useDashboardDemoState.ts` | 269 | Composes all demo flows, persists session, maps activity → reopen receipts, returns a large bag of fields. | **High** before real wallets — this is the integration seam |
| `src/components/RecentActivityList/RecentActivityList.tsx` | 265 | List + filters + search + hide-peek + formatting. | **Medium** |
| `src/testingFeedback/TestingFeedbackPanel.tsx` | 255 | Full research panel UI. | **Low** |
| `src/components/RollingBalanceValue/RollingBalanceValue.tsx` | 250 | Digit roll animation. | **Medium** |
| `src/components/WalletMenuPanel/WalletMenuPanelEthereum.tsx` | 198 | Wallet panel UI (filename still says “Ethereum” from the old A/B). | **Low** to rename; **medium** to refactor layout |

CSS of similar weight (not components, but same “too much in one file”): `WhatIsArmada.module.css` (~649), `MarketingHero.module.css` (~410), `WalletMenuPanel.module.css` (~314), `BalanceCard.module.css`, `AmountInputScreen.module.css`, `SiteHeader.module.css`.

---

## 2. Duplicated logic / repeated patterns

| What’s duplicated | Where | What’s wrong | Risk to fix |
|-------------------|--------|--------------|-------------|
| Modal flow orchestrators | `DepositModalFlow`, `SendModalFlow`, `EarnModalFlow`, `WithdrawModalFlow`, `RequestModalFlow` | Same mobile `BottomSheet` vs `FlowModalOverlay` + `ModalShell` + `ModalStepSwitch` + exit timing + `useMobileLayout`. | **High** — one abstraction can regress all flows |
| Confirmed screens | `DepositConfirmedScreen`, `SendConfirmedScreen`, `EarnConfirmedScreen`, `ReceivePaymentConfirmedScreen`, `RequestPaidConfirmedScreen`, etc. | Same column + title + amount + summary + “View explorer” / “Go to dashboard”. Earn even reuses `DepositConfirmedScreen.module.css`. | **Medium** |
| Review summary tables | `DepositReviewSummary`, `SendReviewSummary`, `EarnReviewSummary`, `ReceivePaymentReviewSummary`, `RequestReceiveReviewSummary` | Same row/label/value markup; Earn already imports Deposit’s CSS. | **Medium** |
| Connect-wallet provider list | `ConnectWalletOverlay.tsx` (`WALLETS`) and `ConnectWalletPicker.tsx` (`CONNECT_WALLETS`) | Identical MetaMask / Phantom / WalletConnect entries and icons. | **Low** |
| Desktop scroll handoff hook | `MarketingHero.tsx` (`useDesktopHandoff`) and `WhatIsArmada.tsx` (same 768px `matchMedia` pattern) | Copy-paste instead of `useMobileLayout` / shared hook. Marketing uses **min-width 768** (desktop-true) vs app hook **max-width 767** (mobile-true) — easy to get inverted. | **Medium** |
| Overlay a11y stack | `FlowModalOverlay`, `ConnectWalletOverlay`, `BottomSheet`, `SidePanel`, `MockMetaMaskPopup` | Repeated `createPortal` + `useBodyScrollLock` + `useFocusTrap` + `useEscapeKey`. Partly shared already; not fully. | **Medium** |
| Tick-ring spinner | `HeroUsdcSpinner.tsx` and `TxProgressCard.tsx` | Same `--i` tick spans + CSS custom property. | **Low** |
| Clipboard “copied” timeout | `WalletMenuPanelEthereum`, `BalanceCard`, `SendRecipientScreen`, request link screen | Same 2s timer + try/catch clipboard. | **Low** |
| Fee helpers | `depositFee.ts` vs `sendFee.ts` (`calculateSendFee` always `0`) vs `protocolFee.ts` | Demo semantics are split across three modules with similar names. | **Low** |

---

## 3. Inline styles / hardcoded values vs tokens

Documented `EXCEPTION` comments in CSS are intentional (Figma marketing, MetaMask chrome). Still worth tracking.

| File | What’s wrong | Risk to fix |
|------|--------------|-------------|
| `src/pages/Homepage.tsx` | `HOMEPAGE_CHROME_FILL = '#f8d197'` for `theme-color` / iOS chrome (same as `--semantic-color-brand-amber` / `--primitives-color-amber-100` family). | **Low** if you only swap to the token string in JS |
| `src/pages/Homepage.module.css` | `background-color: #f8d197 !important` | **Low** |
| `src/components/WhatIsArmada/WhatIsArmada.module.css` | `#ffffff`, `#f9f3ef`, `#000000`, `rgba(0,0,0,0.7)`, `--diagram-stroke: #5a4a62` | **Medium** — marketing contrast is tuned by eye |
| `src/components/WhatIsArmada/FoundationsCubeGrid.tsx` | Cube colors `'#291433'`, `'#5a4a62'` (exist as purple-900 / diagram stroke) | **Medium** |
| `src/components/SiteHeader/SiteHeader.module.css` | `#ffffff` / black mixes for mobile menu | **Medium** |
| `src/components/MarketingHero/MarketingHero.module.css` | Overlay `#000000` (commented EXCEPTION) | **Low** to leave |
| `src/components/MockMetaMaskPopup/MockMetaMaskPopup.module.css` | Full MetaMask palette (`#24272a`, `#037dd6`, `#f6851b`, …) | **Low** — should **not** use Armada tokens |
| `src/components/TxProgressCard/TxProgressCard.module.css` | `rgb(14 13 15 / 65%)` ≈ `--primitives-color-neutral-0` | **Low** |
| `src/components/WalletPillMenu/WalletPillMenu.module.css` | `rgb(255 255 255 / 0.4)` glass | **Low** |
| `src/components/Tooltip/Tooltip.module.css` | `rgba(0, 0, 0, 0.32)` shadow | **Low** |
| `src/components/WalletButton/WalletButton.module.css` | `rgba(255,255,255,…)` shine | **Low** |
| `src/testingFeedback/TestingFeedbackPanel.module.css` | `rgba(0,0,0,0.35)` overlay | **Low** |
| `src/components/BalanceCard/BalanceCard.tsx` | `BALANCE_BASE_FONT_SIZE_PX = 44`, `BALANCE_MIN_FONT_SIZE_PX = 24` (token sizes exist as unitless primitives) | **Medium** — fit algorithm |
| `src/components/WalletMenuPanel/WalletMenuPanelEthereum.tsx` | `ETHEREUM_WALLET_HERO_ICON_SIZE = 56`, `ETHEREUM_USDC_ROW_ICON_PX = 40` | **Low** |
| `src/components/WalletPillMenu/WalletPillMenu.tsx` | `PILL_ICON_SIZE = 24`, `PILL_FADE_MS = 180` | **Low** |
| `src/components/TokenBadge/TokenBadge.tsx` | Inline `width`/`height` from `size` prop (required for web3icons) | **Low** — keep |
| `src/components/MarketingHero/MarketingHero.tsx` | Inline `backgroundImage` URL and pin `height` | **Low** — dynamic |
| `src/components/TimelineVariant.tsx` / `SegmentedControl` / scramble / modal step | Inline transform/height/CSS variables | **Low** — motion, not color |
| `src/constants/viewportBreakpoints.ts` | Raw `767` / `1440` / `799` px; comments still talk about **crowdfund** My Position / Progress card | **Low** to fix comments; **medium** to change numbers (must stay in sync with CSS `@media (min-width: 768px)`) |

`src/styles/tokens.css` / `theme-overrides.css` hex values are the source of truth, not violations.

---

## 4. Inconsistent naming

| File / pattern | What’s wrong | Risk to fix |
|----------------|--------------|-------------|
| `WalletMenuPanelEthereum.tsx` | Only remaining panel; “Ethereum” is leftover from v1/v2. | **Low** rename + import update |
| `LandingHero.tsx` / `WalletItem.tsx` / `Tooltip.tsx` | Default exports; almost everything else is named. `LandingHero/index.ts` re-exports both default and named. | **Low** |
| `hooks/nestedDialog.ts` | File is not `useNestedDialog.ts`; exports `registerNestedDialog` + `useNestedDialogCount`. | **Low** |
| `pages/*FlowConstants.ts` vs `constants/` | App domain types (`DemoWalletProvider`, demo addresses) live under `pages/depositFlowConstants.ts` and are imported by components. | **Medium** — many imports |
| `viewportBreakpoints.ts` | Crowdfund-era names/comments (`LAPTOP_LAYOUT_*`, `SHORT_VIEWPORT_*`) unused in this app except `MOBILE_LAYOUT_MAX_WIDTH_PX`. | **Low** |
| CSS `*Legacy` in MarketingHero | **Done** — production classes renamed: `contentLegacy` → `content`, `bottomLegacy` → `bottom`, `introLegacy` → `intro`, `headingLegacy` → `heading`. | — |
| `EarnConfirmedScreen` CSS | Imports `DepositConfirmedScreen.module.css` | **Low** — naming lie |
| Dual connect components | Overlay vs Picker — names are fine; lists are duplicated (see §2). | — |

---

## 5. Prop drilling / unused props

| File | What’s wrong | Risk to fix |
|------|--------------|-------------|
| `ArmadaAppDashboard.tsx` → `BalanceCard` | `onMore` is accepted and passed; `BalanceCard` **does not destructure or use** `onMore` or `onWithdraw`. | **Low** |
| `WalletMenuPanelProps.onSelectWallet` | Required on panel → shell → pill → header. **`WalletMenuPanelEthereum` does not take it.** Multi-wallet switcher was removed; callback is dead at the leaf. | **Low** |
| `DashboardHeader.onConnect` | Optional; only used when `wallets.length === 0`. Fine. | — |
| `DashboardOverlays` | Takes entire `useDashboardDemoState` return value and destructures ~40 fields. Not drilling through UI layers, but a **god-object** prop. | **High** to split before wallet wiring |
| `AmountInputScreen` | Many optional props (`headerSlot`, `introSlot`, `focusKey`, `layout`, …) used by some flows only — not unused, but the API is wide. | **High** to slim without a per-flow wrapper |
| `useEnvironment` | Returns `[environment, applyEnvironment]`; **no caller uses `applyEnvironment`**. | **Low** |

---

## 6. console.log, commented-out code, TODOs

| File | What’s wrong | Risk to fix |
|------|--------------|-------------|
| `src/testingFeedback/useSessionLogger.tsx` | `console.log('[TestingFeedback] session end', …)` | **Low** — layer is off |
| `src/testingFeedback/persistFeedback.ts` | `console.warn` on persist failure | **Low** — appropriate for a debug API |
| TODOs / FIXMEs | **None** in `src/` | — |
| Commented-out functions | **None** found | — |
| `src/hooks/dashboard/useDashboardActivity.ts` | `eslint-disable-next-line react-hooks/exhaustive-deps` | **Medium** to “fix” deps (stale timers vs extra resets) |

---

## 7. Type safety gaps

| File | What’s wrong | Risk to fix |
|------|--------------|-------------|
| Project-wide | **No `any`**. Strict TS. | — |
| `src/utils/dashboardActivity.ts` | `item as Record<string, unknown>` in `normalizeActivityItems` — session JSON is untyped. | **Medium** — bad session data already has to be defensive |
| `src/utils/payViaLink.ts` | `JSON.parse(raw) as unknown` then narrowed — good pattern | **Low** |
| `src/components/PrivacySphere/useThreeScene.ts` | `pts as unknown as number[]` for LineGeometry | **Low** if Three types stay at 0.128 |
| `src/testingFeedback/useSessionLogger.tsx` | `window as unknown as Record<string, TestingSession>` debug global | **Low** |
| `src/components/AmountInputScreen/AmountInputScreen.tsx` | `focusKey?: unknown` | **Low** |
| `api/testing-feedback.ts` | **Not in `tsconfig.json` `include`** (`"include": ["src"]`) — Vercel function is not typechecked by `npm run build`. | **Medium** for the API file only |
| Tests | **No `*.test.ts` / `*.spec.ts`**. Refactors are visually verified only. | Raises risk of every other fix |

---

## 8. Unclear responsibility (data / business / UI mixed)

| File | What’s wrong | Risk to fix |
|------|--------------|-------------|
| `useDashboardDemoState.ts` | Right place for demo orchestration, but it also **persists sessionStorage**, **maps activity → modal reopen**, and **redirects home** on reset. Will need a real wallet/session layer beside it. | **High** if mixed with wagmi in the same hook |
| `DashboardOverlays.tsx` | UI routing of modals **plus** testing-feedback questions on complete. Comment still says “all dashboard layout variants”. | **Low** to strip testing; **medium** to split overlay map |
| `useRequireConnectedWallet.ts` | Hook performs `window.location.replace` — navigation as a side effect of render cycle. | **Medium** |
| `AmountInputScreen.tsx` | UI + fee policy (`deposit-fee-aware`) + keypad state machine. | **High** |
| `SendRecipientScreen.tsx` | UI + `useEnvironment() === 'mock'` branching. | **Medium** |
| Marketing 3D (`useThreeScene`, `useBeyondCaptureScene`, `FoundationsCubeGrid`) | Scene graphs live next to page sections; no `src/scenes/` (or similar) boundary. | **Medium** |
| `pages/depositFlowConstants.ts` | Demo addresses, provider type, chain labels imported by **components** (wallet menu, connect overlay). Pages folder acting as a domain module. | **Medium** |
| `testingFeedback/` | Still imported from `main-dashboard.tsx` and overlays; gated by a flag. Fine until the new feedback flow lands. | **Low** |

What is already in good shape: per-flow hooks (`useDepositFlow`, `useSendFlow`, …), `ModalShell` / `TxProcessingLayout` reuse, CSS Modules, almost no `any`, connect/focus-trap primitives.

---

## Suggested order (when you choose to act)

1. **Low risk:** unused props (`onMore`, `onWithdraw`, `onSelectWallet` leaf), `applyEnvironment`, crowdfund comments in `viewportBreakpoints.ts`, rename `WalletMenuPanelEthereum`, drop unused breakpoint exports, testing `console.log`.
2. **Medium:** shared wallet-provider list; shared confirmed-screen / review-row primitives; move `DemoWalletProvider` out of `pages/`; tokenise homepage chrome hex; extract `useDesktopHandoff`.
3. **High / later (wallets):** do **not** merge modal flows or split `AmountInputScreen` / `BalanceCard` in the same PR as wallet connect. Treat `useDashboardDemoState` as the swap boundary.

No tests means even “low risk” CSS/token changes need a visual pass on `/`, `/homepage`, `/dashboard` (desktop + mobile), and one full deposit + send path.
