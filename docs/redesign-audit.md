# PaytmAdvanced (PayPulse) — Visual Redesign Audit (Phase 1)

**Audit Date:** November 2026  
**Audited By:** Senior Product Designer & Frontend Engineer  
**Branch:** `redesign/ui-v2`  

---

## 1. Executive Summary & Stack Analysis

PaytmAdvanced (branded in code as **PayPulse**) is a multi-application Turborepo monorepo encompassing consumer banking, merchant checkout, simulated bank settlement, and architecture documentation. The current implementation functions solidly on a logical level, but exhibits visual fragmentation, inconsistent color hierarchies, scattered component patterns, and lack of a cohesive design system.

### Tailwind & CSS Architecture
- **Tailwind Version:** Tailwind CSS **v4.3.2** with `@tailwindcss/postcss` across all applications.
- **Configuration Pattern:** Pure **CSS-first** architecture. There are **no** `tailwind.config.js` or `tailwind.config.ts` files in the repository.
- **Where Tokens Must Live:**
  - Tailwind v4 defines theme extensions directly in CSS via `@theme` or `@theme inline` blocks alongside standard CSS custom properties (`:root`).
  - To share tokens across `apps/user-app`, `apps/merchant-app`, and `apps/bank-app`, the design tokens must be consolidated into a centralized CSS file in `packages/ui` (e.g. `packages/ui/src/styles/theme.css` or `@repo/ui/theme.css`), and imported via `@import "@repo/ui/theme.css";` in each application's `app/globals.css`.
  - Semantic variables (such as `--bg`, `--surface`, `--surface-subtle`, `--border`, `--border-strong`, `--text`, `--text-muted`, `--text-faint`, `--primary`, `--accent`, `--success`, `--danger`, `--warning`) will provide the single source of truth for the "Calm Ledger" design direction.

---

## 2. Monorepo App Directory & Route Mapping

### A. `apps/user-app` (Port 3000 — Consumer Wallet & Personal App)
- **Layouts:**
  - `app/layout.tsx`: Root wrapper injecting `Providers` (NextAuth SessionProvider).
  - `app/dashboard/layout.tsx`: Desktop fixed sidebar navigation (`w-64`), top header bar with breadcrumb context and `NotificationBell`, and mobile sliding drawer menu.
- **Routes & Pages:**
  - `/` (`app/page.tsx`): Consumer landing page featuring PayPulse branding, hero section, account choice cards (Personal vs Business), 6 feature blocks, security section, and footer.
  - `/login` (`app/login/page.tsx`): Personal login form (Phone Number + Password) authenticating via NextAuth Credentials.
  - `/signup` (`app/signup/page.tsx`): Personal registration form (Full Name, Email, Phone, Password).
  - `/dashboard` (`app/dashboard/page.tsx`): Main wallet home displaying available balance hero card, quick action buttons (Scan & Pay, Add Money, Send Money, Withdraw, Audit Ledger), `SearchUsers` combobox, `DashboardAnalytics` (cash flow velocity, expense category bars, top friends), recent transactions list, and quick send avatars.
  - `/dashboard/transfer` (`app/dashboard/transfer/page.tsx`): P2P transfer interface with debounced user search, amount input, expense category pills (`Food`, `Shopping`, `Travel`, `Entertainment`), note field, and client-side idempotency key generation.
  - `/dashboard/transactions` (`app/dashboard/transactions/page.tsx`): Comprehensive transaction history with search query filtering, direction tabs (`ALL`, `SENT`, `RECEIVED`), and pagination.
  - `/dashboard/on-ramp` (`app/dashboard/on-ramp/page.tsx`): Deposit simulation interface with quick amount chips (`₹100`, `₹250`, `₹500`, `₹1000`, `₹2000`, `₹5000`), breakdown box, and redirect to bank gateway.
  - `/dashboard/withdraw` (`app/dashboard/withdraw/page.tsx`): Bank payout withdrawal interface with quick amount chips, linked account preview, fee calculations, and bank payout redirect.
  - `/dashboard/profile` (`app/dashboard/profile/page.tsx` & `components/ProfileView.tsx`): User profile summary, wallet ID clipboard utility, contact details, and session sign-out.
  - `/dashboard/reconciliation` (`app/dashboard/reconciliation/page.tsx`): Double-entry ledger audit console featuring 4 KPI metric cards, wallet balance discrepancy inspector table, continuous append-only `ledger_entries` table with direction filters and pagination, and automated balance synchronization trigger.
  - `/dashboard/scan` (`app/dashboard/scan/page.tsx` & `components/QRScanner.tsx`): In-browser camera QR code scanner powered by `html5-qrcode` and file dropzone decoder powered by `jsqr`.
  - `/dashboard/merchant` (`app/dashboard/merchant/page.tsx`): Gateway stub directing consumer users to the dedicated merchant portal.
  - `/pay` (`app/pay/page.tsx`): In-store merchant checkout screen. Reads `?transactionId=...`, queries `/api/payment`, displays merchant name and amount, executes wallet debit, and presents a receipt.
  - `/scan` (`app/scan/page.tsx`): Redirect helper to `/dashboard/scan`.
  - `/transfer` (`app/transfer/page.tsx`): Standalone P2P payment screen (an older variant with light styling and hardcoded blue hues).

### B. `apps/merchant-app` (Port 3002 — Business & Merchant Console)
- **Layouts:**
  - `app/layout.tsx`: Root layout with `Providers` (NextAuth SessionProvider for merchant role).
- **Routes & Pages:**
  - `/` (`app/page.tsx`): Merchant gateway landing page with sign-in and registration links.
  - `/login` (`app/login/page.tsx`): Merchant authentication (Business Email + Password).
  - `/signup` (`app/signup/page.tsx`): Business registration (Business Name, Owner Name, Email, Phone, Password).
  - `/dashboard` (`app/dashboard/page.tsx`): Merchant management dashboard featuring:
    - Business header and verified status badges.
    - Available merchant balance card.
    - 4 KPI StatCards (`Today's Revenue`, `This Month`, `Successful Payments`, `Pending Payments`).
    - `ReceivePaymentCard`: Generates dynamic transaction requests via `PaymentRequestModal.tsx`.
    - `MerchantQRCard`: Displays and downloads the business's static store QR code.
    - `RevenueChart`: 7-day revenue velocity bar chart.
    - `RecentPayments`: Interactive table of customer checkout payments with status pills.

### C. `apps/bank-app` (Port 3001 — External Bank Gateway Simulation)
- **Layouts:**
  - `app/layout.tsx`: Root layout.
- **Routes & Pages:**
  - `/` (`app/page.tsx`): Gateway landing page explaining simulated bank webhooks.
  - `/pay` (`app/pay/page.tsx`): NetBanking deposit portal. Validates `?token=...`, displays mock account balance, simulates 256-bit authentication, debits bank account, and triggers webhook settlement back to `user-app`.
  - `/payout` (`app/payout/page.tsx`): NetBanking withdrawal portal. Validates payout token, verifies wallet debit, and credits the simulated bank account.

### D. `apps/docs` (Port 3003 — Internal Architecture Documentation)
- Turborepo starter template with documentation links and the lone import of `@repo/ui/button`.

### E. `apps/workers` (Background Jobs)
- Pure Node.js background services (BullMQ / ioredis outbox relay and notification dispatcher). No frontend routes.

---

## 3. Package Inventory & `@repo/ui` Usage Audit

| Package | Purpose | Current Exports | Consumers |
| :--- | :--- | :--- | :--- |
| `packages/ui` | Shared component library | `button.tsx`, `card.tsx`, `code.tsx` (all starter templates) | Currently **only** consumed by `apps/docs/app/page.tsx`. Neither `user-app` nor `merchant-app` uses it! |
| `packages/store` | Zustand client state | `useBalance.ts` | Consumed by `user-app` |
| `packages/db` | Prisma schema, client singleton, and seeders | `prisma` client | Consumed by `user-app`, `merchant-app`, `bank-app`, `workers` |
| `packages/queue` | BullMQ Redis queue definitions | Queue instances | Consumed by `user-app`, `workers` |
| `packages/typescript-config` | Shared TS configs | `base.json`, `nextjs.json`, `react-library.json` | Consumed across monorepo |
| `packages/eslint-config` | Shared ESLint configs | `base.js`, `next.js`, `react-internal.js` | Consumed across monorepo |

**Critical Observation:**  
Currently, `packages/ui` is an untapped starter stub. Every button, input, table, modal, badge, and card in `user-app` and `merchant-app` is handwritten with ad-hoc Tailwind classes. In Phase 3, `packages/ui` will be transformed into the core design system housing all "Calm Ledger" components and tokens.

---

## 4. Comprehensive Inventory of UI Patterns

### Forms & Interactive Inputs
- **Authentication:**
  - `user-app` Login (Phone, Password)
  - `user-app` Signup (Name, Email, Phone, Password)
  - `merchant-app` Login (Email, Password)
  - `merchant-app` Signup (Business Name, Owner Name, Email, Phone, Password)
- **Financial Actions:**
  - `user-app` P2P Transfer (Recipient search combobox, Amount with `₹` prefix, Expense Category pills, Remarks note)
  - `user-app` Add Money On-Ramp (Amount input, Quick-select chips: ₹100, ₹250, ₹500, ₹1000, ₹2000, ₹5000)
  - `user-app` Withdraw Money Off-Ramp (Amount input, Quick-select chips: ₹100, ₹500, ₹1000, ₹2000, ₹5000, ₹10000, Linked bank account card)
  - `merchant-app` Payment Request Modal (Amount input, Note field, Dynamic SVG QR preview)

### Tables & Data Grids
- **`user-app/dashboard/transactions`:** Filterable transaction statement with search, tabs (`ALL`, `SENT`, `RECEIVED`), credit/debit indicators, and page navigation.
- **`user-app/dashboard/reconciliation` (Ledger Entries):** Append-only table of atomic double-entry legs (`ledger_entries`) with filters for `CREDIT` vs `DEBIT`, search, and timestamp formatting.
- **`user-app/dashboard/reconciliation` (Discrepancy Inspector):** Table comparing stated balance vs net ledger sum with drift status.
- **`merchant-app/components/RecentPayments`:** Merchant customer checkout payments table showing Customer ID, Amount, Note, Date, and Status (`SUCCESS`, `PENDING`, `FAILED`).

### Modals & Dialogs
- **`merchant-app/components/PaymentRequestModal`:** Modal overlay presenting generated checkout QR codes, shareable link clipboard utility, and live polling for payment confirmation.

### Dropdowns, Menus & Navigation
- **`user-app/components/NotificationBell` & `NotificationDropdown`:** Top-right bell trigger with unread badge count, dropdown card with tabbed notifications, and dismiss/read triggers.
- **`user-app/app/dashboard/layout.tsx` (Sidebar & Drawer):** Desktop vertical rail with active route highlighting; mobile hamburger drawer toggle.
- **`merchant-app/app/dashboard/page.tsx` (Header Bar):** Direct refresh and logout controls.

### Toasts, Alerts & Feedback
- Inline error messages across login and signup forms (`⚠️ {error}`).
- Idempotent transfer confirmation and error banners (`apps/user-app/app/dashboard/transfer/page.tsx`).
- Live toast notification banner in `apps/user-app/app/dashboard/reconciliation/page.tsx`.
- Security assurance chips ("256-bit SSL Secured", "Verified Account", "Active Session").
- Payment confirmation receipts (`apps/user-app/app/pay/page.tsx` and `apps/bank-app/app/pay/page.tsx`).

### Loading, Empty, and Error States
- **Loading:**
  - Pulse skeleton blocks in `DashboardAnalytics.tsx` and `pay/page.tsx`.
  - Spinners in `bank-app` payment and payout gateways.
  - Table loading rows in `RecentPayments.tsx` and `reconciliation/page.tsx`.
- **Empty States:**
  - "No recent wallet transactions found" (`dashboard/page.tsx`).
  - "People you pay will appear here" (`dashboard/page.tsx`).
  - "No user found matching..." (`dashboard/transfer/page.tsx`).
  - "No matching transactions found" (`dashboard/transactions/page.tsx`).
  - "No outgoing payments yet" / "No incoming transfers yet" (`DashboardAnalytics.tsx`).
  - "No payment requests yet" (`RecentPayments.tsx`).
- **Error States:**
  - Failed analytics retry card in `DashboardAnalytics.tsx`.
  - "Payment Request Unavailable" / invalid transaction state in `pay/page.tsx`.
  - Payout token expiry alert in `bank-app/app/payout/page.tsx`.

---

## 5. Current Styling Inconsistencies Between Apps

| Dimension | `apps/user-app` | `apps/merchant-app` | `apps/bank-app` | Target ("Calm Ledger") |
| :--- | :--- | :--- | :--- | :--- |
| **Color Theme** | Pitch dark (`#090d16`, `#0f172a`) on most pages; but `/transfer` is light (`#f4f7fa`) with `#002e6e` & `#00baf2`. | Layout says `bg-slate-50`, but dashboard is dark `#090d16` with purple/indigo accents (`from-indigo-600 to-purple-600`). | Gateway home is dark (`#090d16`), but pay & payout gateways are stark white (`bg-slate-50`, `#06244f`). | **Warm stone neutrals**: `#FAFAF7` bg, `#FFFFFF` surface, deep ink-green `#0F3D33` primary, signal lime `#C8F169` accent. Dark theme tokens ready. |
| **Typography** | Default system fallback font; loose inconsistent tracking; amounts lack tabular digits. | Default system fallback; inconsistent font weights. | Mixed serif and sans-serif fonts; no uniform tabular numerals. | **Geist Sans** for UI; **Geist Mono** with tabular figures (`tabular-nums`) for all currency, IDs, dates, and amounts. |
| **Borders & Elevation** | Heavy glowing shadows (`shadow-cyan-500/20`), varying borders (`border-slate-800`, `border-slate-800/80`). | Purple gradients (`shadow-indigo-600/20`), heavy card shadows. | Soft blue shadows (`shadow-blue-900/5`), random border colors (`border-slate-200`). | **1px hairline borders** (`#E7E6DF`), subtle depth, single soft popover elevation. No stacked or colored glows. |
| **Border Radii** | Mix of `rounded-xl`, `rounded-2xl`, `rounded-3xl`, and `rounded-full`. | Mix of `rounded-xl`, `rounded-2xl`, `rounded-3xl`. | Mix of `rounded-xl`, `rounded-3xl`, `rounded-full`. | **Strict radius scale**: `6px` badges/inputs, `10px` cards/buttons, `16px` modals only. |
| **Currency Formats** | Raw string concatenation (`₹${amount}`), `.toLocaleString()`, and `.toLocaleString("en-IN")`. | `.toLocaleString("en-IN")`. | `.toFixed(2)` and raw numbers. | **Standardized `<Amount />` component** enforcing `Intl.NumberFormat('en-IN')` with Geist Mono. |
| **Status Indicators** | Neon cyan, rose, and emerald pulses. | Amber, emerald, and indigo tags. | Green text chips. | **Harmonized semantic badges** (`success`, `warning`, `danger`, `info`) with muted tint backgrounds. |

---

## 6. Verification of README Claims vs Real Code

- **Claim:** The README references the platform as "PayPulse" and models real-world payment lifecycles across consumer, merchant, and banking domains.
  - **Verdict: VERIFIED.** All three applications exist and correspond to ports 3000, 3001, and 3002.
- **Claim:** Shared UI package `@repo/ui` centralizes design components.
  - **Verdict: DISCREPANCY.** `@repo/ui` was never populated beyond initial template files and is only imported in `apps/docs`. Phase 3 will fulfill this claim by establishing the true shared UI system.
- **Claim:** Double-entry ledger records and reconciliation engine enforce debits equal credits.
  - **Verdict: VERIFIED.** `packages/db` has `ledger_entries`, `user-app` has an active reconciliation dashboard, and atomic interactive transactions back all transfers.
- **Claim:** In-browser QR scanning via `html5-qrcode` and `jsqr`.
  - **Verdict: VERIFIED.** Real camera feed and image upload decoding operate inside `apps/user-app/components/QRScanner.tsx`.
