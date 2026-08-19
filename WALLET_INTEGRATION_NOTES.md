# Wallet integration notes

Read this file **first** before starting real wallet connection work. It lists demo-layer code that will need review, rewrite, or removal when wallets replace the current sessionStorage / hardcoded-provider demo.

Risk here is the chance of breaking dashboard or connect UX if the item is changed without tracing dependents — not how “wrong” the demo is today.

---

## Seed list

### `src/hooks/useDashboardDemoState.ts`

| | |
|--|--|
| **What it does now** | Composes all demo flows, persists session to sessionStorage, maps activity to modal reopen state, redirects home on reset. |
| **Why it's on the list** | This is the integration seam — where demo logic becomes real wallet logic. Do not refactor casually. Review fully before wallet work starts. |
| **Risk** | **High** |

### `src/utils/walletMenu.ts` (`ConnectedWallet.chain`)

| | |
|--|--|
| **What it does now** | Each connected wallet has a `chain` (`DepositChainId`). Demo connect always sets Sepolia (`WALLET_PANEL_DEFAULT_CHAIN`). The wallet panel tag, USDC row, explorer link, and shield deposit use this field. |
| **Why it's on the list** | Real connectors must set `chain` from the wallet’s active network (wagmi `chainId` → `DepositChainId`), not leave the Sepolia default. |
| **Risk** | **Medium** |

### `src/utils/walletMenu.ts` (`legacyWallet` parameter)

| | |
|--|--|
| **What it does now** | Demo-wallet normalization: builds a fallback session shape from an older single-`DemoWallet` format when no connected-wallets array exists. |
| **Why it's on the list** | Needs review before real wallets land — likely deleted rather than carried forward, but check what depends on this shape first. |
| **Risk** | **Low** to review, but easy to forget it exists |

### `src/hooks/useEnvironment.ts`

| | |
|--|--|
| **What it does now** | Subscribes to the mock / sepolia environment (`localStorage` key `armada-environment`). Returns `[environment]` only (`applyEnvironment` was already removed as unused). Default SSR snapshot is `'mock'`. |
| **Why it's on the list** | Will need to be reconsidered once `"mock"` isn't a real environment option anymore. The setter still lives on `src/utils/environment.ts` as `setEnvironment`. |
| **Risk** | **Low** |

---

## Mock environment branches (`=== 'mock'` / `!== 'mock'`)

### `src/hooks/useDashboardDemoState.ts` (`isMock`)

| | |
|--|--|
| **What it does now** | `isMock = environment === 'mock'`. Passes `isMock` into activity; **only writes** `writeDemoDashboardSession` when mock. |
| **Why it's on the list** | Persistence of wallet, balances, and activity is gated on mock. A real session layer must replace this write path, not leave it writing fake wallets. |
| **Risk** | **High** (same seam as the seed entry) |

### `src/hooks/dashboard/sessionReaders.ts`

| | |
|--|--|
| **What it does now** | Hydrates wallet, connected wallets, deposit-complete, earn balance, activity, and healed USDC balance from demo session. Several readers **no-op or return empty/false** when `getCurrentEnvironment() !== 'mock'`. |
| **Why it's on the list** | First paint of the dashboard is environment-gated demo storage, not a chain. Replacing wallets without replacing these readers leaves empty or stale state. |
| **Risk** | **High** |

### `src/hooks/dashboard/useDashboardActivity.ts`

| | |
|--|--|
| **What it does now** | Takes `isMock`. Some persist / timer paths only run when mock. |
| **Why it's on the list** | Activity list and “reopen receipt from activity” are demo-session features. Real txs need a different source of truth. |
| **Risk** | **Medium** |

### `src/pages/SendRecipientScreen.tsx`

| | |
|--|--|
| **What it does now** | `isMock = environment === 'mock'`. In mock, clipboard preview and paste use canned `DEMO_0X_RECIPIENT` / `DEMO_ZK_RECIPIENT` instead of the real clipboard; other mock-only branches around recent addresses / input. |
| **Why it's on the list** | Send/withdraw recipient UX will lie about clipboard if mock gating is left in production. |
| **Risk** | **Medium** |

### `src/utils/environment.ts`

| | |
|--|--|
| **What it does now** | `Environment = 'mock' \| 'sepolia'`. Reads/writes `localStorage` `armada-environment`. Defaults to `'mock'`. |
| **Why it's on the list** | Environment is not a wallet, but every mock gate above depends on it. Decide whether sepolia vs mainnet lives here or in wagmi/chain config. |
| **Risk** | **Medium** |

---

## `DemoWalletProvider` (defined in `constants/demoWallets.ts`)

The type `'metamask' | 'phantom' | 'walletconnect'` and hardcoded addresses (`DEMO_WALLET_ADDRESS`, `DEMO_ADDRESS_BY_PROVIDER`) live in **`src/constants/demoWallets.ts`**. `pages/depositFlowConstants.ts` re-exports them for deposit pages. Connect UI uses `CONNECT_WALLET_OPTIONS` from `constants/connectWallets.tsx`.

### `src/constants/demoWallets.ts`

| | |
|--|--|
| **What it does now** | Owns `DemoWalletProvider`, per-provider fake addresses, `resolveDemoWalletAddress`. |
| **Why it's on the list** | Real connectors will not use these addresses. Replace in one pass with wagmi/connector ids. |
| **Risk** | **Medium** — many imports |

### `src/hooks/dashboard/useDemoWalletSession.ts`

| | |
|--|--|
| **What it does now** | Instant connect: `createConnectedWallet(provider)` with no wallet extension, EIP-1193, or signatures. Holds `wallet`, `connectedWallets`, `activeWalletId`, connect overlay open. Disconnect with no remaining wallets calls full session reset (landing redirect). |
| **Why it's on the list** | This **is** the fake `connectWallet` / `disconnectWallet` API the header and overlays call. Swap or wrap here; do not also invent a second session in `useDashboardDemoState` without a plan. |
| **Risk** | **High** |

### Connect UI (duplicate provider lists)

| File | What it does now |
|------|------------------|
| `src/components/ConnectWalletOverlay/ConnectWalletOverlay.tsx` | Overlay list `WALLETS` keyed by `DemoWalletProvider`; `onSelect(provider)`. |
| `src/components/ConnectWalletPicker/ConnectWalletPicker.tsx` | Same MetaMask / Phantom / WalletConnect entries as `CONNECT_WALLETS`. |

| | |
|--|--|
| **Why they're on the list** | Lists and callbacks are demo IDs, not connector IDs. Overlay and picker are duplicated — replace both with one real connector list. |
| **Risk** | **Medium** |

### Wallet chrome (prop type only)

These pass `onConnectWallet: (provider: DemoWalletProvider) => void` down to the panel:

- `src/components/DashboardHeader/DashboardHeader.tsx`
- `src/components/WalletPillMenu/WalletPillMenu.tsx`
- `src/components/WalletMenuPanel/WalletMenuShell.tsx`
- `src/components/WalletMenuPanel/WalletMenuPanel.tsx`

| | |
|--|--|
| **What they do now** | UI for the connected demo wallet; connect still means “pick a fake provider”. |
| **Why they're on the list** | Prop types and `createConnectedWallet` wiring must change together with `useDemoWalletSession`. |
| **Risk** | **Medium** |

### `src/constants/walletMenu.ts` + rest of `src/utils/walletMenu.ts`

| | |
|--|--|
| **What they do now** | `DEMO_USDC_BY_PROVIDER`, `createConnectedWallet`, `providerLabel`, canned `DEMO_WALLET_ACTIVITY`. `ConnectedWallet` ids are `provider:address` from demo addresses. |
| **Why they're on the list** | Balances and ids are invented. Real holdings come from RPC / indexer, not this map. |
| **Risk** | **High** for balance truth; **medium** for labels |

### `src/components/MockMetaMaskPopup/` + `src/pages/DepositWalletApproveScreen.tsx`

| | |
|--|--|
| **What it does now** | Fake MetaMask approve/sign chrome inside the deposit flow. `useNestedDialog.ts` documents it as a nested dialog for focus trap. |
| **Why it's on the list** | Real wallets use the extension / WalletConnect modal. This UI should be removed or only kept for a documented mock mode. |
| **Risk** | **Medium** — deposit step machine currently expects this screen |

---

## sessionStorage (and related) wallet / dashboard session

Testing-feedback `sessionStorage` (`src/testingFeedback/sessionPersistence.ts`) is **not** wallet state. Pay-via-link keys in `src/utils/payViaLink.ts` are payment-link drafts, not connected-wallet session — review if pay-via-link should attach to a real account, but do not treat them as the demo wallet blob.

### `src/utils/demoDashboardSession.ts`

| | |
|--|--|
| **What it does now** | Canonical blob `armada-app-demo-dashboard` (wallet, connectedWallets, activeWalletId, balances, activity). Also `armada-app-dashboard-activity-visible` and `…-activity-user-hidden`. Calls `normalizeConnectedWallets` (legacy single-wallet fallback). |
| **Why it's on the list** | Entire “logged in” dashboard is this JSON. Real wallets need a different persist strategy (or none). |
| **Risk** | **High** |

### `src/utils/appNavigation.ts`

| | |
|--|--|
| **What it does now** | `openAppWithWallet()` writes a MetaMask demo wallet + empty balances then `location.assign('/dashboard')`. `hasConnectedWalletSession()` parses the same sessionStorage key for `wallet.address`. `returnToLanding()` clears the demo session. |
| **Why it's on the list** | Landing “Open app” **is** connect. Guard rails for `/dashboard` assume this blob, not an injected provider. |
| **Risk** | **High** |

### `src/hooks/useRequireConnectedWallet.ts`

| | |
|--|--|
| **What it does now** | If `wallet` is falsy, `window.location.replace` to landing. |
| **Why it's on the list** | Auth gate is “demo session object exists”, not “provider connected”. Easy to fight with wagmi reconnect. |
| **Risk** | **Medium** |

### Hardcoded demo addresses in confirmed/review screens

`DEMO_WALLET_ADDRESS` / `DEMO_ARMADA_ADDRESS` still appear as fallbacks (e.g. `DepositReviewScreen.tsx`, `DepositConfirmedScreen.tsx`). Those are display stand-ins, not sessionStorage, but they will show the fake `0x6545…` if real addresses are not threaded through.

| | |
|--|--|
| **Risk** | **Low** individually, **high** if left as fallbacks after connect is real |

---

## Related demo flow hooks (depend on `DemoWalletSession`)

Not the connect API themselves, but they take `walletSession: DemoWalletSession` and credit demo balances / activity:

- `src/hooks/dashboard/useDepositFlow.ts`
- `src/hooks/dashboard/useSendFlow.ts`
- `src/hooks/dashboard/useEarnFlow.ts`
- `src/hooks/dashboard/useWithdrawFlow.ts`
- `src/hooks/dashboard/useRequestFlow.ts`

| | |
|--|--|
| **Why they're on the list** | They assume instant success, demo fees, and session-written activity. Wallet work should treat `useDashboardDemoState` as the swap boundary and **not** merge these flows in the same PR as first connector wiring. |
| **Risk** | **High** if mixed with wagmi in the same change |

---

## Before starting wallet integration
Read this file fully before touching any of the files listed above. 
Do not refactor, merge, or delete anything here without checking what 
currently depends on it.
