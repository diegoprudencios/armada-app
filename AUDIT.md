# Armada App — code quality audit

Date: 2026-08-19 (updated same day after cleanup)  
Scope: `armada-app` only.

Overall: TypeScript is strict and there is almost no `any`. Demo wallet/session logic is already split into hooks. Lab HTML, unused A/B surfaces, dead props, and several naming/token leftovers have been cleaned up. What remains is **oversized UI files**, **copy-pasted flow/summary screens**, **demo-wallet integration** (see `WALLET_INTEGRATION_NOTES.md`), and a few **token/naming** nits.

Risk = chance of visual or flow regressions if you “fix” it, not how bad the code is today.

---

## Addressed (do not re-open)

| Item | What shipped |
|------|----------------|
| Lab / orphan entries | Extra homepages, showcase, deposit demo, tx-processing, unused components/assets removed. Live surfaces: `/`, `/homepage`, `/dashboard`, `/pay-via-link`. |
| `onMore` / `onWithdraw` on `BalanceCard` | Removed from the type and `ArmadaAppDashboard`. |
| `onSelectWallet` | Removed from wallet panel → shell → pill → header. `selectActiveWallet` remains on demo session only. |
| `applyEnvironment` | Removed from `useEnvironment` return. Setter still exists as `setEnvironment` in `environment.ts`. |
| `WalletMenuPanelEthereum.tsx` | Folded into `WalletMenuPanel.tsx`. CSS class names still say `ethereum*` (cosmetic). |
| MarketingHero `*Legacy` | `content` / `bottom` / `intro` / `heading`. |
| Confirmed-screen CSS | Shared `ConfirmedScreen.module.css` (was `DepositConfirmedScreen.module.css`). Components still duplicated. |
| `WhatIsArmada` | Renamed `HomepageFeatures`. Intro `id` is `homepage-features`. |
| Homepage chrome `#f8d197` | `Homepage.module.css` / `Homepage.tsx` use `--semantic-color-brand-amber` (theme-overrides). `homepage.html` keeps the hex for first paint, with a sync comment. |
| HomepageFeatures copy colors | Titles / ghost CTAs → `text-primary`; body → `text-secondary`. |
| Feature panel fill | `--section-panel-bg` → `surface-default` (independent white on the gem wash). `#f9f3ef` removed. |
| Wallet integration map | `WALLET_INTEGRATION_NOTES.md` + comments on `legacyWallet` in `walletMenu.ts`. |

---

## 1. Components that are too large / do too many things

Unchanged structurally. Do **not** split these in the same change as wallet connect.

| File | What’s wrong | Risk to fix |
|------|--------------|-------------|
| `PrivacySphere/useThreeScene.ts` | Heaviest unit — Three.js scene. | **High** |
| `AmountInputScreen.tsx` | Kitchen-sink amount UI for every money flow. | **High** |
| `HomepageFeatures.tsx` | Intro + feature cards + scroll handoff + diagrams. | **Medium** |
| `SiteHeader.tsx` | Mega-menu, drawer, scroll hide, Open App. | **Medium** |
| `FoundationsCubeGrid.tsx` | Canvas + hardcoded diagram hex. | **Medium** |
| `SendRecipientScreen.tsx` | Recipient UX + mock clipboard. | **High** |
| `RequestModalFlow.tsx` | Request/share/QR/step machine. | **High** |
| `BalanceCard.tsx` | Dashboard identity (reveal, scramble, vault, actions). | **High** |
| `dashboardActivity.ts` | Factory + normalize + labels. | **Medium** |
| `PrivacySphereStory.tsx` | SVG + Three host. | **High** if split from `useThreeScene` |
| `MarketingHero.tsx` | Pin, scrub, inlined `useDesktopHandoff`. | **Medium** |
| `testingFeedback/useSessionLogger.tsx` | Gated off; still compiled. | **Low** |
| `DepositModalFlow.tsx` (+ send/earn/withdraw copies) | Parallel modal shells. | **High** to unify |
| `DashboardOverlays.tsx` | Every modal + testing questions. | **Medium** |
| `useDashboardDemoState.ts` | Demo integration seam. | **High** before real wallets |
| `WalletMenuPanel.tsx` | Panel UI (layout refactor still **medium**). | **Medium** to restyle |

Heavy CSS: `HomepageFeatures.module.css`, `MarketingHero.module.css`, `WalletMenuPanel.module.css`, `BalanceCard.module.css`, `AmountInputScreen.module.css`, `SiteHeader.module.css`.

---

## 2. Duplicated logic / repeated patterns

| What’s duplicated | Status | Risk |
|-------------------|--------|------|
| Modal flow orchestrators (deposit/send/earn/withdraw/request) | **Open** — do not merge until wallets. | **High** |
| Confirmed screens | **Partial** — shared CSS module; still separate TSX. | **Medium** |
| Review summary tables | **Open** — Earn still imports Deposit CSS. | **Medium** |
| Connect-wallet lists (`WALLETS` vs `CONNECT_WALLETS`) | **Open**. | **Low** |
| Desktop scroll handoff (`useDesktopHandoff` vs HomepageFeatures `matchMedia`) | **Open**. | **Medium** |
| Overlay a11y stack | **Open** — partly shared. | **Medium** |
| Tick-ring spinner, clipboard 2s timeout, fee helper split | **Open**. | **Low** |

---

## 3. Inline styles / hardcoded values vs tokens

Documented `EXCEPTION` comments (Figma marketing, MetaMask chrome) are intentional.

| File | Status | Risk |
|------|--------|------|
| Homepage chrome / `Homepage.module.css` hex | **Done** (see Addressed). `homepage.html` hex is first-paint only. | — |
| `HomepageFeatures.module.css` copy + panel fill | **Done**. Remaining: `--diagram-stroke: #5a4a62`. | **Medium** for stroke |
| `FoundationsCubeGrid.tsx` | `'#291433'`, `'#5a4a62'` (purple-900 / diagram stroke). | **Medium** |
| `SiteHeader.module.css` | `#ffffff` / black mixes for mobile menu. | **Medium** |
| `MarketingHero.module.css` overlay `#000000` | EXCEPTION — **leave**. | **Low** |
| `MockMetaMaskPopup` palette | **Do not** use Armada tokens. | **Low** |
| Glass / shadow one-offs (pill, tooltip, wallet button, testing overlay) | **Open**. | **Low** |
| `TxProgressCard` `rgb(14 13 15 / 65%)` | **Open**. | **Low** |
| Balance fit `44` / `24` px, wallet icon `56` / `40`, pill `24` / `180ms` | **Open**. | **Low**–**Medium** |
| `viewportBreakpoints.ts` | Crowdfund comments; unused `LAPTOP_LAYOUT_*`, `SHORT_VIEWPORT_*`. | **Low** comments; **medium** to change numbers |

`tokens.css` / `theme-overrides.css` hex values are the source of truth, not violations.

---

## 4. Inconsistent naming

| File / pattern | Status | Risk |
|----------------|--------|------|
| `WalletMenuPanelEthereum.tsx` | **Done** (file). CSS still `ethereum*` / `ETHEREUM_*` constants for the Sepolia network. | **Low** cosmetic |
| `LandingHero` / `WalletItem` / `Tooltip` default exports | **Open**. | **Low** |
| `hooks/nestedDialog.ts` vs `useNestedDialog.ts` | **Open**. | **Low** |
| `pages/depositFlowConstants.ts` as domain module | **Open**. | **Medium** |
| Unused crowdfund breakpoint exports | **Open**. | **Low** |
| MarketingHero `*Legacy` | **Done**. | — |
| Earn confirmed CSS filename | **Done** (`ConfirmedScreen.module.css`). | — |

---

## 5. Prop drilling / unused props

| File | Status | Risk |
|------|--------|------|
| `onMore` / `onWithdraw` / `onSelectWallet` / `applyEnvironment` | **Done**. | — |
| `DashboardHeader.onConnect` | Fine (empty-wallet only). | — |
| `DashboardOverlays` god-object | **Open**. | **High** before wallet wiring |
| `AmountInputScreen` wide optional API | **Open**. | **High** to slim |

---

## 6. console.log, commented-out code, TODOs

| File | Status | Risk |
|------|--------|------|
| `useSessionLogger.tsx` `console.log` | **Open** (layer off). | **Low** |
| `persistFeedback.ts` `console.warn` | Appropriate. | **Low** |
| TODOs / commented-out functions in `src/` | None found (original audit). | — |
| `useDashboardActivity.ts` exhaustive-deps disable | **Open**. | **Medium** to “fix” |

---

## 7. Type safety gaps

Unchanged: no `any`; session JSON casts; Three `LineGeometry` cast; testing-feedback API not in `tsconfig` `include`; **no unit tests**.

---

## 8. Unclear responsibility

Unchanged. Wallet work: read **`WALLET_INTEGRATION_NOTES.md` first**. Do not mix wagmi into `useDashboardDemoState` casually.

`DashboardOverlays.tsx` comment still says “all dashboard layout variants” (stale).

---

## Suggested order (remaining)

1. **Low:** `viewportBreakpoints.ts` comments + unused exports; testing `console.log`; optional `ethereum*` CSS rename; default-export consistency.  
2. **Medium:** one connect-wallet list; extract `useDesktopHandoff`; move `DemoWalletProvider` out of `pages/`; diagram-stroke / cube hex; shared review-row primitive (confirmed CSS already shared).  
3. **High / wallets:** do **not** merge modal flows or split `AmountInputScreen` / `BalanceCard` in the same PR as wallet connect. Treat `useDashboardDemoState` as the swap boundary (`WALLET_INTEGRATION_NOTES.md`).

No tests means even leftover CSS/token changes need a visual pass on `/`, `/homepage`, `/dashboard` (desktop + mobile), and one full deposit + send path.
