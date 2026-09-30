# PayPulse

A production-inspired, full-stack digital wallet and payments platform built with a high-performance TypeScript monorepo. Features atomic peer-to-peer (P2P) transfers, simulated bank on-ramp and off-ramp workflows via webhooks, and QR-code-driven merchant payment requests with instant settlement.

**Repository:** [https://github.com/Darshit9696/PaytmAdvanced](https://github.com/Darshit9696/PaytmAdvanced)


---

## Features

| Feature | Status | Notes |

| **User Credential Authentication** | ✅ Implemented | NextAuth.js v4 credentials provider with phone + bcrypt password verification and 30-day JWT sessions. |
| **Merchant Authentication** | ✅ Implemented | Independent merchant portal auth with email + bcrypt hashing, role validation (`MERCHANT`), and isolated cookies. |
| **Cookie & Session Isolation** | ✅ Implemented | Distinct session cookies (`next-auth.user-session-token` vs `next-auth.merchant-session-token`) prevent session clashing. |
| **Atomic P2P Transfers** | ✅ Implemented | Executes wallet-to-wallet transfers inside `prisma.$transaction` with simultaneous sender and receiver balance updates. |
| **In-App Transaction Notifications** | ✅ Implemented | Automatic notification generation (`TRANSFER_SENT`, `TRANSFER_RECEIVED`) rendered in real time with unread tracking. |
| **Bank On-Ramp (Deposit)** | ✅ Implemented | Generates UUID token in `user-app`, redirects to `bank-app` gateway, debits bank balance, and calls webhook to credit wallet. |
| **Bank Off-Ramp (Payout / Withdrawal)** | ✅ Implemented | Payout flow initiated from wallet, verified at bank gateway, debited atomically, and settled back into bank account. |
| **Merchant Payment Request Creation** | ✅ Implemented | Merchants generate fixed-amount or on-demand payment requests with unique UUID `transactionId` and dynamic SVG QR codes. |
| **Live QR Code Camera Scanner** | ✅ Implemented | In-browser camera scanning via `html5-qrcode` with rear/front camera selection and instant checkout routing. |
| **QR Code File Upload Decoder** | ✅ Implemented | Client-side multi-pass canvas image decoder powered by `jsqr` (high-res downsampling and grayscale thresholding). |
| **Merchant QR Checkout & Settlement** | ✅ Implemented | Users authorize merchant payments with wallet balance; atomically debits wallet, credits merchant, and creates passbook record. |
| **Paginated Transaction History** | ✅ Implemented | Offset-based pagination (`skip`/`take`) filtering sent and received transactions with relational user metadata. |
| **Recipient Search** | ✅ Implemented | Case-insensitive name substring search (`mode: "insensitive"`) for rapid peer discovery. |
| **User Spending Analytics** | ✅ Implemented | Aggregates monthly spend/income, category breakdowns (Food, Shopping, Travel, Entertainment), and top recipient metrics. |
| **Merchant Velocity & Revenue Charts** | ✅ Implemented | Day-by-day weekly revenue chart (Mon-Sun), day-over-day and month-over-month velocity percentages, and success rates. |
| **Shared Database Client Package** | ✅ Implemented | Centralized `@repo/db` package with Prisma client singleton attached to `globalThis` to prevent connection exhaustion. |
| **Shared State Store (`@repo/store`)** | 🚧 In progress | Zustand balance store package exists, but production pages currently manage state locally and via server components. |
| **Pessimistic Row Locking (`FOR UPDATE`)** | 📝 Planned | P2P transfers currently rely on transaction wrappers; row-level pessimistic locks are planned to prevent race conditions. |
| **Webhook Signature Verification (HMAC)** | 📝 Planned | Webhook endpoints currently rely on token matching; cryptographic payload signatures are planned. |
| **Webhook Idempotency Keys** | 📝 Planned | Needed to guard against replay attacks or double-credits if bank webhooks retry delivery. |
| **Automated Test Suite (Unit / E2E)** | 📝 Planned | End-to-end and integration tests using Vitest and Playwright are not yet implemented. |
| **Containerization & CI/CD** | 📝 Planned | Dockerfiles, Docker Compose environment, and GitHub Actions workflows are planned. |

---

## Architecture

The system is organized as a Turborepo monorepo with multiple independent Next.js applications and shared workspace packages. Applications run on separate ports to simulate distinct micro-frontends and third-party bank gateways.

```mermaid
flowchart TD
    subgraph Clients["Applications (Apps)"]
        UserApp["apps/user-app (Port 3000)<br/>Personal Wallet, P2P Transfers,<br/>QR Scanner, Analytics"]
        BankApp["apps/bank-app (Port 3001)<br/>Simulated HDFC NetBanking &<br/>Payment Gateway"]
        MerchantApp["apps/merchant-app (Port 3002)<br/>Business Portal, Payment Requests,<br/>QR Generator, Velocity Dashboard"]
        DocsApp["apps/docs (Port 3003)<br/>Architecture & Internal Documentation"]
    end

    subgraph Packages["Shared Packages (npm workspaces)"]
        RepoDB["@repo/db<br/>Prisma Client Singleton & Schema"]
        RepoStore["@repo/store<br/>Zustand State Hooks"]
        RepoUI["@repo/ui<br/>Shared React UI Components"]
        RepoConfig["@repo/eslint-config<br/>@repo/typescript-config"]
    end

    subgraph External["External Infrastructure"]
        Postgres["Neon PostgreSQL Database<br/>(Cloud Serverless SQL)"]
    end

    UserApp --> RepoDB
    BankApp --> RepoDB
    MerchantApp --> RepoDB
    DocsApp --> RepoUI

    UserApp -.-> RepoStore
    DocsApp -.-> RepoConfig

    RepoDB --> Postgres

    %% On-Ramp Flow
    UserApp -- "1. POST /api/onramp (Token Generated)" --> UserApp
    UserApp -- "2. Redirect to /pay?token=" --> BankApp
    BankApp -- "3. Debit Bank Account & Set Status=Success" --> RepoDB
    BankApp -- "4. POST /api/webhook (Token)" --> UserApp
    UserApp -- "5. Credit Personal Wallet Balance" --> RepoDB

    %% Off-Ramp Flow
    UserApp -- "1. POST /api/off-ramp" --> UserApp
    UserApp -- "2. Redirect to /payout?token=" --> BankApp
    BankApp -- "3. Conditional Debit Wallet & Credit Bank" --> RepoDB
    BankApp -- "4. POST /api/offramp-webhook" --> UserApp

    %% Merchant Payment Flow
    MerchantApp -- "1. Generate Payment Request & QR" --> RepoDB
    UserApp -- "2. Scan QR / Upload Image via Camera" --> UserApp
    UserApp -- "3. POST /api/payment (Atomic Debit/Credit)" --> RepoDB
```

---

## Tech Stack

### Frontend & Applications
- **Next.js 16 (App Router):** Unified framework hosting server components, client interactivity, and serverless API route handlers across all 4 applications.
- **React 19:** Powers interactive client components, form handling, and camera scanning interfaces.
- **TypeScript 5:** Strict static typing across models, API responses, and shared workspace packages.
- **Tailwind CSS 4:** Utility-first styling for dark-mode interfaces, responsive layouts, and modal workflows.
- **Lucide React:** Consistent iconography across user and merchant interfaces.

### Backend & API Layer
- **Next.js Route Handlers (`app/api/**/route.ts`):** Co-located, serverless REST endpoints handling business logic, authentication guards, and transactions. *Note: Express and Hono are not used; all backend logic runs natively inside Next.js.*
- **NextAuth.js v4:** Session management using JWT strategy with isolated cookie configurations.
- **bcrypt:** Secure password hashing (10 salt rounds) for users and merchants.

### Database & ORM
- **PostgreSQL (Neon Serverless):** Relational database managing ACID transactions, account balances, and relational history.
- **Prisma ORM 6:** Type-safe database queries, declarative migrations, and relational modeling.
- **Singleton Client Pattern:** Prisma client attached to `globalThis` in development to eliminate connection leakages caused by Next.js Fast Refresh.

### QR Code Infrastructure
- **`qrcode.react`:** Generates clean, scalable SVG QR codes containing structured checkout URLs for merchants.
- **`html5-qrcode`:** Hardware camera integration for real-time video stream scanning.
- **`jsqr`:** Client-side fallback decoder with multi-pass image preprocessing (high-resolution downsampling and contrast thresholding) for uploaded screenshots.

### Monorepo & Tooling
- **Turborepo 2:** High-performance build system with task pipelines, dependency caching, and topological execution.
- **npm Workspaces:** Native multi-package dependency linking across `apps/*` and `packages/*`.

---

## Project Structure

```text
paytm-advanced-app/
├── apps/
│   ├── user-app/                  # Port 3000: Personal wallet & consumer application
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── dashboard/analytics/ # Spending breakdown, category aggregations, top friends
│   │   │   │   ├── notifications/       # User transaction notifications
│   │   │   │   ├── off-ramp/            # Initiates wallet-to-bank withdrawal
│   │   │   │   ├── offramp-webhook/     # Confirmation listener for completed withdrawals
│   │   │   │   ├── onramp/              # Initiates bank-to-wallet deposit token
│   │   │   │   ├── payment/             # Merchant checkout settlement (GET details & POST debit)
│   │   │   │   ├── signup/              # User registration + wallet & bank account initialization
│   │   │   │   ├── transactions/        # Paginated P2P transaction history
│   │   │   │   ├── transfer/            # Atomic wallet-to-wallet P2P money transfer
│   │   │   │   ├── user/                # Public profile lookup by ID
│   │   │   │   ├── users/search/        # Case-insensitive user search
│   │   │   │   └── webhook/             # On-ramp bank webhook listener (credits wallet)
│   │   │   ├── dashboard/               # User dashboard layout, scan, transfer, on-ramp, withdraw
│   │   │   ├── pay/                     # Merchant checkout page (resolves ?transactionId=...)
│   │   │   ├── scan/                    # Full-page QR code scanner view
│   │   │   ├── login/ & signup/         # Authentication views
│   │   │   └── layout.tsx & page.tsx
│   │   ├── components/                  # QRScanner, NotificationBell, DashboardAnalytics, SearchUsers
│   │   ├── lib/                         # NextAuth configuration (authOptions) & axios client
│   │   └── package.json
│   │
│   ├── bank-app/                  # Port 3001: Simulated HDFC NetBanking & Gateway
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── pay/                 # Debits bank account & triggers user-app on-ramp webhook
│   │   │   │   ├── payout/              # Debits wallet & triggers user-app off-ramp webhook
│   │   │   │   ├── user/                # Validates on-ramp token & returns bank details
│   │   │   │   └── user/payout/         # Validates off-ramp token & returns payout details
│   │   │   ├── pay/                     # NetBanking payment gateway UI (/pay?token=...)
│   │   │   ├── payout/                  # NetBanking withdrawal confirmation UI (/payout?token=...)
│   │   │   └── layout.tsx & page.tsx
│   │   └── package.json
│   │
│   ├── merchant-app/              # Port 3002: Standalone business merchant console
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── merchant/dashboard/  # 7-day velocity charts, today/month revenue, success rates
│   │   │   │   ├── merchant/me/         # Authenticated merchant profile & balance
│   │   │   │   ├── merchant/signup/     # Business onboarding with 10-digit phone & email
│   │   │   │   ├── merchant/transaction/# Creates payment request with UUID transactionId
│   │   │   │   ├── payments/            # Lists merchant transactions with status filters
│   │   │   │   └── signup/              # Re-export to merchant signup
│   │   │   ├── dashboard/               # Merchant dashboard, QR generator, revenue charts
│   │   │   ├── login/ & signup/         # Merchant auth views
│   │   │   └── layout.tsx & page.tsx
│   │   ├── components/                  # MerchantQRCard, PaymentRequestModal, ReceivePaymentCard
│   │   ├── lib/                         # Merchant NextAuth config (isolated cookies & role)
│   │   └── package.json
│   │
│   └── docs/                      # Port 3003: Architecture documentation viewer
│       ├── architecture.md              # Monorepo architecture & data flow decisions
│       └── package.json
│
├── packages/
│   ├── db/                        # Centralized database package (@repo/db)
│   │   ├── prisma/
│   │   │   ├── schema.prisma            # Single source of truth for database models
│   │   │   └── migrations/              # Production migration history
│   │   ├── src/
│   │   │   └── index.ts                 # PrismaClient singleton attached to globalThis
│   │   └── package.json
│   ├── store/                     # Shared client state package (@repo/store)
│   │   ├── src/hooks/useBalance.ts      # Zustand balance store
│   │   └── package.json
│   ├── ui/                        # Shared UI components package (@repo/ui)
│   ├── eslint-config/             # Shared ESLint configs (@repo/eslint-config)
│   └── typescript-config/         # Shared tsconfig bases (@repo/typescript-config)
│
├── package.json                   # Root workspace package.json (npm workspaces scripts)
└── turbo.json                     # Turborepo task pipeline definitions
```

---

## Data Model

The schema is maintained in [`packages/db/prisma/schema.prisma`](file:///D:/paytm-advanced-app/packages/db/prisma/schema.prisma) and deployed to PostgreSQL:

```mermaid
erDiagram
    User ||--o| Wallet : owns
    User ||--o| BankAccount : links
    User ||--o{ Transaction : sends
    User ||--o{ Transaction : receives
    User ||--o{ OnRampTransaction : deposits
    User ||--o{ OffRampTransaction : withdraws
    User ||--o{ MerchantTransaction : pays_as_customer
    User ||--o{ Notification : receives_notifications
    Merchant ||--o{ MerchantTransaction : generates_requests

    User {
        int id PK
        string number UK "Unique phone number"
        string email UK "Optional email"
        string name
        string password "bcrypt hash"
        datetime createdAt
        datetime updatedAt
    }

    Wallet {
        int id PK
        int balance "Default: 10,000"
        int userId FK,UK
    }

    BankAccount {
        int id PK
        int userId FK,UK
        string accountNumber UK "12-digit random string"
        int balance "Default: 50,000"
        string bankName "Default: HDFC"
    }

    Transaction {
        int id PK
        int amount
        string note "Optional"
        string category "Optional (Food, Shopping, etc.)"
        int senderId FK
        int receiverId FK
        datetime createdAt
    }

    Merchant {
        int id PK
        string businessName
        string ownerName
        int balance "Default: 100,000"
        string email UK
        string phone UK
        string password "bcrypt hash"
        enum authType "CREDENTIALS, GOOGLE, GITHUB"
    }

    MerchantTransaction {
        int id PK
        string transactionId UK "UUID"
        int amount
        int merchantId FK
        string note "Optional"
        int customerId FK "Optional User ID"
        enum status "PENDING, SUCCESS, FAILED"
        datetime createdAt
    }

    OnRampTransaction {
        int id PK
        string token UK "UUID"
        int amount
        string provider "HDFC"
        enum status "Processing, Success, Failure"
        datetime startTime
        int userId FK
    }

    OffRampTransaction {
        int id PK
        string token UK "UUID"
        int amount
        string provider "HDFC"
        enum status "Processing, Success, Failure"
        datetime startTime
        int userId FK
    }

    Notification {
        int id PK
        int userId FK
        enum type "TRANSFER_SENT, TRANSFER_RECEIVED, PAYMENT_FAILED"
        string title
        string message
        boolean isRead "Default: false"
        datetime createdAt
    }
```

---

## Key Engineering Decisions

### 1. Atomic Balance Operations & Concurrency Trade-offs
- **P2P Transfer Flow (`/api/transfer`):** Transfers run inside `prisma.$transaction(async (tx) => { ... })`. Inside the block, the recipient's balance is incremented and the sender's balance is decremented, followed by record creation in `Transaction` and dual `Notification` rows.
- **How Off-Ramp Payout Enforces Non-Negative Balances (`/api/payout`):** Rather than performing an unprotected decrement, the payout gateway uses an atomic conditional check:
  ```typescript
  const walletUpdate = await tx.wallet.updateMany({
    where: { userId, balance: { gte: amount } },
    data: { balance: { decrement: amount } }
  });
  if (walletUpdate.count === 0) throw new Error("INSUFFICIENT_WALLET_BALANCE");
  ```
- **Known Limitation in P2P Transfers:** In `user-app/api/transfer`, the wallet balance check is performed *prior* to entering `prisma.$transaction`. While execution happens inside an interactive transaction, it currently lacks pessimistic row-level locking (`SELECT ... FOR UPDATE`). Rapid, concurrent requests with the same sender could race past the check before the balance decrements. Adding conditional updates or raw SQL locks is prioritized on the roadmap.

### 2. Transaction Lifecycle & Double-Spend Prevention
- Merchant transactions begin in `PENDING` state with a unique UUID.
- When `/api/payment` is invoked, it re-queries the transaction status inside `prisma.$transaction`. If the status is no longer `PENDING`, the transaction throws an immediate error and rolls back, preventing double charges on the same QR code.
- Upon completion, the status transitions to `SUCCESS`, the paying user's `userId` is recorded as `customerId`, and a reciprocal passbook transaction is created.

### 3. Asynchronous Bank Webhooks
- In the on-ramp flow, the banking gateway (`bank-app`) simulates real-world payment aggregators:
  1. `user-app` creates an `OnRampTransaction` with a UUID token and `Processing` status.
  2. The user is redirected to the external bank portal (`http://localhost:3001/pay?token=...`).
  3. The bank debits the user's mock `BankAccount` and flags the transaction as `Success`.
  4. The bank dispatches a server-to-server POST request to `http://localhost:3000/api/webhook`.
  5. `user-app` verifies the transaction status and credits the user's `Wallet`.
- **Known Limitation:** The webhook listener currently verifies that `status === "Success"`, but does not yet enforce cryptographic HMAC signatures or update-state idempotency flags (a re-delivered webhook payload could theoretically increment the wallet balance again).

### 4. NextAuth Multi-Tenancy & Cookie Isolation
- Regular users authenticate via 10-digit phone number, while merchants authenticate via business email.
- Because both applications share `localhost` during local development, standard `next-auth.session-token` cookies would overwrite each other.
- The session configuration customizes cookie names:
  - `user-app`: `next-auth.user-session-token` (Role: `USER`)
  - `merchant-app`: `next-auth.merchant-session-token` (Role: `MERCHANT`)
- Both apps enforce server-side role checks: `user-app` blocks users with role `merchant` from personal transfers, and `merchant-app` restricts API routes strictly to `MERCHANT` sessions.

### 5. Prisma Connection Pool Management
- Next.js development mode triggers Fast Refresh on file save, which re-executes module code.
- Standard instantiation (`new PrismaClient()`) would spawn a new connection pool on every reload, rapidly crashing Neon PostgreSQL with `Fatal: too many connections`.
- [`packages/db/src/index.ts`](file:///D:/paytm-advanced-app/packages/db/src/index.ts) binds the instance to `globalThis.prisma`, preserving the active database connection pool across hot reloads.

---

## API Overview

### User Application (`apps/user-app` - Port 3000)

| Method | Path | Auth Required | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/signup` | No | Creates a user account, initial HDFC bank account, and seed wallet. |
| `POST` | `/api/transfer` | Yes (`USER`) | Executes an atomic P2P wallet balance transfer and notifies peers. |
| `POST` | `/api/onramp` | Yes (`USER`) | Initiates an on-ramp deposit token and returns the bank redirect URL. |
| `POST` | `/api/webhook` | No (Internal) | Bank-to-wallet webhook listener; verifies token and credits wallet. |
| `POST` | `/api/off-ramp` | Yes (`USER`) | Initiates an off-ramp payout token and returns the payout gateway URL. |
| `POST` | `/api/offramp-webhook`| No (Internal) | Bank-to-wallet payout confirmation webhook listener. |
| `GET`  | `/api/payment` | No | Fetches merchant payment request details (`amount`, `note`, `merchant`). |
| `POST` | `/api/payment` | Yes (`USER`) | Authorizes merchant checkout payment from user wallet. |
| `GET`  | `/api/transactions` | Yes (`USER`) | Fetches paginated list of user transactions (`?page=1`, limit 10). |
| `GET`  | `/api/notifications` | Yes (`USER`) | Returns user notification stream sorted by most recent first. |
| `GET`  | `/api/users/search` | No | Searches registered users by name substring (`?query=...`). |
| `GET`  | `/api/dashboard/analytics`| Yes (`USER`) | Aggregates monthly spend/income, daily/weekly charts, and top friends. |

### Bank Gateway Application (`apps/bank-app` - Port 3001)

| Method | Path | Auth Required | Purpose |
| :--- | :--- | :---: | :--- |
| `GET`  | `/api/user` | No | Resolves on-ramp token to account name, balance, and amount. |
| `POST` | `/api/pay` | No | Debits bank account, updates token to `Success`, calls `user-app` webhook. |
| `GET`  | `/api/user/payout` | No | Resolves off-ramp payout token and returns user and bank balances. |
| `POST` | `/api/payout` | No | Atomically debits wallet, credits bank account, calls off-ramp webhook. |

### Merchant Application (`apps/merchant-app` - Port 3002)

| Method | Path | Auth Required | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/merchant/signup` | No | Registers business merchant with email, phone, and hashed password. |
| `GET`  | `/api/merchant/me` | Yes (`MERCHANT`) | Returns profile and current settled balance for authenticated merchant. |
| `POST` | `/api/merchant/transaction`| Yes (`MERCHANT`)| Creates payment request with UUID `transactionId` and description. |
| `GET`  | `/api/payments` | Yes (`MERCHANT`) | Lists merchant payments with optional status filter (`?status=SUCCESS`). |
| `GET`  | `/api/merchant/dashboard` | Yes (`MERCHANT`) | Generates 7-day revenue velocity charts and day/month trends. |

---

## Getting Started

### Prerequisites
- **Node.js:** `>= 18.0.0`
- **npm:** `>= 10.0.0`
- **PostgreSQL Database:** A running PostgreSQL instance or a free cloud database from [Neon](https://neon.tech/).

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Darshit9696/PaytmAdvanced.git
cd PaytmAdvanced
npm install
```

### 2. Configure Environment Variables

Create the required `.env` files across the workspace:

#### Database Package (`packages/db/.env`)
```env
DATABASE_URL="postgresql://username:password@ep-sample-pool-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### User Application (`apps/user-app/.env.local`)
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-user-nextauth-secret-change-in-production"
USER_APP_WEBHOOK_URL="http://localhost:3000/api/webhook"
USER_APP_OFFRAMP_WEBHOOK_URL="http://localhost:3000/api/offramp-webhook"
```

#### Bank Application (`apps/bank-app/.env.local`)
```env
USER_APP_WEBHOOK_URL="http://localhost:3000/api/webhook"
USER_APP_OFFRAMP_WEBHOOK_URL="http://localhost:3000/api/offramp-webhook"
```

#### Merchant Application (`apps/merchant-app/.env.local`)
```env
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="development-merchant-nextauth-secret-change-in-production"
```

### 3. Generate Prisma Client & Run Migrations
From the repository root:
```bash
# Generate the Prisma Client
npm run --workspace=@repo/db db:generate

# Apply database migrations to PostgreSQL
npm run --workspace=@repo/db db:migrate
```

### 4. Start the Development Servers
Run all applications concurrently using Turborepo:
```bash
npm run dev
```

The apps will be available at:
| Application | URL | Purpose |
| :--- | :--- | :--- |
| **User App** | `http://localhost:3000` | Consumer wallet dashboard, transfers, scan & pay |
| **Bank Gateway** | `http://localhost:3001` | Simulated HDFC NetBanking payment & payout gateway |
| **Merchant App** | `http://localhost:3002` | Merchant business portal & payment request creator |
| **Documentation** | `http://localhost:3003` | Monorepo architecture viewer |

To run an individual app in isolation:
```bash
npm run dev --workspace=user-app      # Runs user-app on port 3000
npm run dev --workspace=bank-app      # Runs bank-app on port 3001
npm run dev --workspace=merchant-app  # Runs merchant-app on port 3002
```

---

## Testing

*Status: Not yet implemented.*

Automated test suites (unit, integration, and E2E) are currently on the technical roadmap. Contributions should focus on:
- Unit testing monetary decimal calculations and balance assertions.
- Concurrency testing for simultaneous P2P wallet transfers.
- Integration testing for simulated bank webhook dispatches.
- End-to-end testing of the QR code checkout flow using Playwright.

---

## Roadmap

### Done (Completed)
- [x] Turborepo monorepo configuration with npm workspaces
- [x] Shared `@repo/db` package with Prisma singleton client pattern
- [x] User authentication with NextAuth.js, bcrypt, and JWT sessions
- [x] Merchant onboarding and dedicated authentication portal
- [x] Session cookie isolation between user and merchant portals
- [x] Atomic P2P money transfers via `prisma.$transaction`
- [x] In-app notification engine for sent and received transfers
- [x] Bank on-ramp deposit simulation with webhook callbacks
- [x] Bank off-ramp withdrawal simulation with conditional balance debit
- [x] Merchant payment request generation with unique UUIDs
- [x] Dynamic QR code generation (`qrcode.react`)
- [x] Real-time camera QR scanner (`html5-qrcode`)
- [x] Multi-pass image upload QR decoder (`jsqr`)
- [x] Merchant checkout and balance settlement pipeline
- [x] Paginated transaction passbook history
- [x] Real-time recipient search
- [x] User personal spending analytics and chart breakdown
- [x] Merchant weekly revenue velocity and status analytics

### Next (Reliability & Scale)
- [ ] **Pessimistic Row Locking:** Implement raw SQL `SELECT ... FOR UPDATE` on wallet transfers to guard against concurrent balance race conditions.
- [ ] **Webhook HMAC Signatures:** Sign webhook payloads from `bank-app` with an HMAC-SHA256 signature to verify message authenticity in `user-app`.
- [ ] **Webhook Idempotency Keys:** Persist unique delivery IDs or record state flags to prevent duplicate credits upon webhook retries.
- [ ] **API Rate Limiting:** Introduce Redis/Upstash token-bucket rate limiting on `/api/transfer`, `/api/onramp`, and auth endpoints.
- [ ] **Automated Testing Suite:** Configure Vitest for financial logic unit tests and Playwright for cross-app E2E testing.
- [ ] **Containerization:** Create production multi-stage Dockerfiles and `docker-compose.yml` for local orchestration.
- [ ] **CI/CD Pipeline:** Implement GitHub Actions for linting, type-checking, database migrations, and build validation.

---

## Known Limitations

1. **Concurrent Balance Race Conditions:** In `apps/user-app/app/api/transfer/route.ts`, sender balance checks are evaluated prior to entering `prisma.$transaction`. While the increment and decrement occur atomically, two simultaneous transfers could theoretically pass the balance threshold before either decrement is finalized.
2. **Webhook Replay Vulnerability:** In `apps/user-app/app/api/webhook/route.ts`, the webhook checks `transaction.status === "Success"`, but does not mark the record as "settled into wallet". If the webhook endpoint receives duplicate requests, the user's wallet will be credited multiple times.
3. **Hardcoded Gateway Origin Fallbacks:** Client redirects in `user-app` and `bank-app` default to `http://localhost:3001` and `http://localhost:3000` when environment variables are omitted, requiring explicit `.env` configuration for staging or production domains.
4. **Shared Store Integration:** `@repo/store` provides a Zustand implementation of `useBalanceStore`, but application components currently fetch balance states directly from the database or server session.

---

## Author

- **GitHub:** [@Darshit9696](https://github.com/Darshit9696)
- **Email:** [bhattdarshit11@gmail.com](mailto:bhattdarshit11@gmail.com)
- **LinkedIn:** [TODO: Add your LinkedIn profile URL]

---

## License

This project is licensed under the [ISC License](LICENSE).