# Calm Ledger Design System

## 1. Overview & Philosophy

**Concept:** "Calm Ledger."
Money user interfaces should feel like a well-kept, mathematically precise ledger, not a gamified casino or glowing crypto dashboard. Hierarchy is established through clean typography, disciplined spacing, and 1px hairline borders rather than heavy color gradients or stacked drop shadows.

### Core Tenets
1. **Precision & Tabular Alignment:** Every monetary amount, transaction reference, account number, and timestamp is displayed with tabular numerals (`tabular-nums`) in a dedicated monospace font (`Geist Mono`). Columns align cleanly.
2. **Quiet Warm Neutrals:** Cold bluish grays have been eliminated in favor of warm stone neutrals (`#FAFAF7` background, `#FFFFFF` surfaces, `#E7E6DF` hairline borders).
3. **Intentional Accent:** The primary color is deep ink-green (`#0F3D33`). Signal lime (`#C8F169`) is used sparingly as a high-signal accent (maximum one focal highlight per viewport, such as verified ledger chips or active camera viewfinder corners).
4. **Zero Fabrication:** The UI renders real data from database records and real API routes. When no data exists, intentional empty states guide the user.

---

## 2. Design Tokens

The design tokens are defined centrally in `packages/ui/src/styles/theme.css` and exposed via Tailwind CSS v4 `@theme` and CSS custom properties.

### 2.1 Color Palette

| Token Name | CSS Custom Property | Tailwind Token | Value | Description / Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | `--color-bg` | `bg-bg` | `#FAFAF7` | Warm stone page background |
| **Surface** | `--color-surface` | `bg-surface` | `#FFFFFF` | Primary card, modal, and table surface |
| **Surface Subtle** | `--color-surface-subtle` | `bg-surface-subtle` | `#F4F4EF` | Input fills, row hover states, secondary chips |
| **Border** | `--color-border` | `border-border` | `#E7E6DF` | Standard 1px hairline border |
| **Border Strong** | `--color-border-strong` | `border-border-strong`| `#D3D2C9` | Hovered or focused component borders |
| **Text Primary** | `--color-text` | `text-text` | `#0E1512` | Highest contrast text (headings, labels, amounts) |
| **Text Muted** | `--color-text-muted` | `text-text-muted` | `#525A55` | Secondary descriptions, column headers (WCAG AA) |
| **Text Faint** | `--color-text-faint` | `text-text-faint` | `#666F6A` | Timestamps, placeholders, inactive icons (WCAG AA) |
| **Primary** | `--color-primary` | `bg-primary`, `text-primary` | `#0F3D33` | Deep ink-green brand color |
| **Primary Hover** | `--color-primary-hover` | `bg-primary-hover` | `#0B2F27` | Interactive button hover state |
| **Primary Subtle** | `--color-primary-subtle`| `bg-primary-subtle` | `#E4EFEB` | Soft ink-green tint for selections |
| **Accent** | `--color-accent` | `bg-accent`, `text-accent` | `#C8F169` | Signal lime highlight (viewfinders, chips) |
| **Accent Hover** | `--color-accent-hover` | `bg-accent-hover` | `#B5E350` | Accent button hover state |
| **Success** | `--color-success` | `text-success` | `#177A4B` | Confirmed credits, positive drift, verified |
| **Success Subtle** | `--color-success-subtle`| `bg-success-subtle` | `#E8F5EE` | Soft tint background for success pills |
| **Warning** | `--color-warning` | `text-warning` | `#B7791F` | Pending transactions, ledger drift alerts |
| **Warning Subtle** | `--color-warning-subtle`| `bg-warning-subtle` | `#FEF7EC` | Soft tint background for warning pills |
| **Danger** | `--color-danger` | `text-danger` | `#C0392B` | Debits, payment errors, account sign out |
| **Danger Subtle** | `--color-danger-subtle` | `bg-danger-subtle` | `#FCEEED` | Soft tint background for debit pills |
| **Info** | `--color-info` | `text-info` | `#2B5C8A` | Notice banners, informational badges |
| **Info Subtle** | `--color-info-subtle` | `bg-info-subtle` | `#EDF4F9` | Soft tint background for info banners |

### 2.2 Dark Theme Tokens & Architecture (Fully Implemented)
Dark theme is integrated across the monorepo with zero flash of unstyled theme (FOUC) using `@repo/ui`:
- **Background (`--bg` / `bg-bg`):** `#0A0F0D` (deep warm carbon)
- **Surface (`--surface` / `bg-surface`):** `#111815` (elevated ledger card surface)
- **Surface Subtle (`--surface-subtle` / `bg-surface-subtle`):** `#16211C` (inputs, table headers, hover)
- **Border (`--border` / `border-border`):** `#223129` (subtle 1px hairline border)
- **Border Strong (`--border-strong` / `border-border-strong`):** `#33463B` (focused or active elements)
- **Text Primary (`--text` / `text-text`):** `#EDF2EE` (crisp high-contrast text)
- **Text Muted (`--text-muted` / `text-text-muted`):** `#B0BCB6` (secondary metadata, WCAG AA 8.2:1)
- **Text Faint (`--text-faint` / `text-text-faint`):** `#8F9C95` (timestamps, placeholders, WCAG AA 5.7:1)
- **Primary (`--primary` / `bg-primary`):** `#5FD3A8` (high-contrast mint green)
- **Primary Tint (`--primary-tint` / `bg-primary-tint`):** `#143328` (soft mint background)
- **Primary Foreground (`--primary-fg` / `text-primary-fg`):** `#0A0F0D` (accessible dark contrast, WCAG AA 10.4:1)

#### Theme Components (`@repo/ui`):
- `<ThemeProvider>`: React Context managing `"light" | "dark" | "system"` with `localStorage` persistence and cross-tab synchronization.
- `<ThemeScript>`: Blocking inline script in `<head>` to prevent flash of light theme on cold page loads.
- `<ThemeToggle>`: Multi-variant UI control (`icon`, `segmented`, `dropdown`) with smooth transition animations and full accessibility support.

---

## 3. Typography

### 3.1 Font Families
- **UI & Body:** `Geist Sans`, system fallback (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`) via `font-sans`.
- **Numbers & Monospace:** `Geist Mono`, system fallback (`ui-monospace`, `SFMono-Regular`, `Consolas`, `monospace`) via `font-mono`.

### 3.2 Tabular Numerals & Currency Standard
- Indian Rupee (`₹`) formatting strictly adheres to the Indian numbering system (`Intl.NumberFormat('en-IN')`).
- Example: `₹1,24,500.00`.
- All monetary values utilize the shared `<Amount />` component with `tabular-nums` and `font-mono`.

### 3.3 Type Scale
- `11px` / `12px` (`text-[11px]` / `text-xs`): Labels, timestamps, column headers, status badges.
- `13px` / `14px` (`text-sm`): Base body text, table cell values, form input text.
- `16px` (`text-base`): Card headers, section subtitles.
- `20px` (`text-xl`): Page headers, modal titles.
- `24px` / `32px` (`text-2xl` / `text-3xl`): Stat card numbers, transfer amounts.
- `36px` / `48px` (`text-4xl`): Hero wallet balance displays (`font-light` / `font-semibold`, tight letter-spacing).

---

## 4. Spacing, Geometry & Depth

- **Grid:** Strict 4px base grid (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
- **Max-Width:**
  - `user-app`: max `1200px` (`max-w-6xl`).
  - `merchant-app`: max `1440px` with dense sidebar-content layout.
  - Auth & Gateways: max `480px` centered or 50/50 split screen.
- **Strict Border Radii:**
  - `6px` (`rounded-[6px]`): Inputs, select dropdowns, search bars, status badges.
  - `10px` (`rounded-[10px]`): Interactive buttons, stat cards, dashboard hero containers.
  - `16px` (`rounded-[16px]`): Modals and popovers only.
  - *No pill-everything or rounded-3xl blobs.*
- **Depth & Hairline Borders:**
  - Physical depth is expressed primarily through `1px solid var(--color-border)`.
  - Shadows are minimized to hairline ambient hints (`shadow-xs` / `shadow-sm`), with soft elevation only for elevated dialogs.

---

## 5. Per-App Personalities

### 5.1 `user-app` (Consumer Portal)
- Light, spacious, and consumer-friendly.
- **Top hero balance card** prominently displays settled balance, quick action buttons (`Send Money`, `Add Money`, `Withdraw`, `Scan & Pay`, `Audit Ledger`).
- **Navigation:**
  - Desktop: Slim left rail with icon + label links and active indicator.
  - Mobile: Bottom tab bar (`Dashboard`, `Transfer`, `History`, `Profile`) fixed at viewport bottom.
- **Reconciliation Audit:** Includes a real-time double-entry audit engine testing that debits strictly equal credits across the database.

### 5.2 `merchant-app` (Business & POS Console)
- Denser and data-forward.
- **Desktop Sidebar:** Dark ink-green (`#0F3D33`) rail with store branding, status indicator, navigation anchors, cross-app link, and sign-out action.
- **Mobile Drawer:** Collapsible hamburger drawer preserving all navigation links.
- **KPI Strip:** 4 compact stat cards (`Today's Volume`, `This Month`, `Settled Orders`, `Pending Checkouts`).
- **Point of Sale:**
  - Instant charge request generator with dynamic QR generation.
  - Downloadable countertop standee QR card.
  - 7-day revenue velocity bar chart.
  - Live customer payment settlement log.

### 5.3 Landing & Authentication
- **Split Layout Auth:**
  - Left panel: Ink-green (`#0F3D33`) brand panel with subtle geometric line grid and clear value statement.
  - Right panel: Warm stone surface with clean credentials form, inline validation, and state toggles.
- **Landing Page:**
  - Clear hero with headline: *"Payments made simple. Every rupee accounted for."*
  - Product preview built from real components (`<Amount />`, `<Avatar />`, paired debit/credit records).
  - 3 feature blocks (Instant Transfers, Protected Wallet, Commercial Point-of-Sale).
  - Account selection matrix (Personal vs Business).
  - Trust and cryptographic invariant verification section.

### 5.4 `bank-app` (Simulation Gateway)
- Clean NetBanking simulation for deposits (`/pay?token=...`) and payouts (`/payout?token=...`).
- Stepper feedback (Processing -> Webhook Dispatch -> Return to Dashboard).

---

## 6. Shared Component Catalog (`@repo/ui`)

| Component | File Path | Props & Description |
| :--- | :--- | :--- |
| `Amount` | `packages/ui/src/amount.tsx` | Formats INR with `₹` and Indian digit groupings in `Geist Mono` tabular numbers. Supports `value`, `size`, `weight`, `variant`, `sign`. |
| `Button` | `packages/ui/src/button.tsx` | Standard button with variants `primary`, `secondary`, `outline`, `ghost`, `danger`, `accent`. Supports `loading` and backwards-compatible `appName`. |
| `Input` | `packages/ui/src/input.tsx` | Accessible form input with 6px radius, hairline border, and focus-visible ring. |
| `Select` | `packages/ui/src/select.tsx` | Stylized select dropdown with chevron icon. |
| `Textarea` | `packages/ui/src/textarea.tsx` | Multi-line text field matching input styling. |
| `Field` | `packages/ui/src/field.tsx` | Wrapper uniting label, hint, and error message with any input component. |
| `Card` | `packages/ui/src/card.tsx` | Warm stone container with 10px radius and hairline border. Exports `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. |
| `Badge` | `packages/ui/src/badge.tsx` | Status pill component with semantic variants (`default`, `primary`, `success`, `warning`, `danger`, `accent`). |
| `Avatar` | `packages/ui/src/avatar.tsx` | Circular contact avatar displaying clean user initials with deterministic color tints. |
| `Table` | `packages/ui/src/table.tsx` | Data table with sticky header (`bg-surface-subtle`), row hover, and mobile-friendly responsive wrappers. |
| `Tabs` | `packages/ui/src/tabs.tsx` | Accessible segmented control tab bar. |
| `Modal` | `packages/ui/src/modal.tsx` | 16px radius dialog with backdrop blur, Escape key listener, and body scroll lock. |
| `Dropdown` | `packages/ui/src/dropdown.tsx` | Popover menu for contextual actions. |
| `Alert` / `Toast` | `packages/ui/src/toast.tsx` | Notification banner with semantic icons (`success`, `warning`, `danger`, `info`). |
| `Skeleton` | `packages/ui/src/skeleton.tsx` | Pulse shimmer loader matching exact component shapes. |
| `EmptyState` | `packages/ui/src/empty-state.tsx` | Clean empty state with icon, title, description, and action CTA. |
| `ErrorState` | `packages/ui/src/error-state.tsx` | Failure recovery state with retry action. |
| `PageHeader` | `packages/ui/src/page-header.tsx` | Consistent page title, breadcrumb back button, and action slot. |
| `Sidebar` | `packages/ui/src/sidebar.tsx` | Collapsible desktop rail and mobile navigation. |
| `BottomTabBar` | `packages/ui/src/bottom-tab-bar.tsx` | Consumer mobile bottom tab bar. |
| `StatCard` | `packages/ui/src/stat-card.tsx` | KPI metric card with title, amount, trend change, and icon. |
| `Sparkline` | `packages/ui/src/sparkline.tsx` | Lightweight inline SVG area chart. |

---

## 7. Architectural Guarantees & Constraints

1. **No Logic Alteration:** All API endpoints, server actions, authentication providers, and Prisma database models remain untouched.
2. **Double-Entry Invariants:** The frontend visually displays and audits the 3 invariants of the system:
   - *Conservation:* Total Debits strictly equals Total Credits across all transactions.
   - *Atomicity:* Every transfer commits exactly 1 DEBIT and 1 CREDIT entry.
   - *Determinism:* Current wallet balance equals the net sum of credits minus debits.
3. **Responsive Breakpoints:** Tested across 360px (mobile), 768px (tablet), 1024px (small desktop), and 1440px (wide monitor) with zero horizontal page scroll.
