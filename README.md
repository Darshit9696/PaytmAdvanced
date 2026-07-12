# Paytm Clone: Monorepo Architecture & Data Flow

## 1. Three-Layer Pipeline
* **Frontend Application (`apps/user-app`):** Acts as the interface and API routing layer. It does not handle database logic or credentials directly.
* **Shared Database Package (`packages/db`):** Houses the Prisma schema, migrations, and the centralized client wrapper. It acts as the single source of truth for the database schema across all apps.
* **Cloud Database (Neon Postgres):** The secure, external physical storage layer that processes data via a secure SSL connection string.

## 2. The Prisma Singleton Pattern (`packages/db/src/index.ts`)
* **The Problem:** Next.js uses Fast Refresh in development, which re-executes code files on every save. Standard instantiation (`new PrismaClient()`) spawns a brand-new connection pool on every hot-reload, rapidly crashing the database with "too many connections" errors.
* **The Solution:** The client is attached to `globalThis` in development. Because `globalThis` persists across hot-reloads, the application reuses the existing active database connection instead of opening a new one.

## 3. Why Separate Apps (User App vs. Merchant App)?
Instead of making the Merchant Dashboard a component or folder inside the User App, it is isolated into its own independent application for three reasons:
1. **Security:** Keeps sensitive corporate business logic, internal banking integration code, and merchant endpoints completely hidden from regular user-facing frontend bundles.
2. **Authentication:** Separates standard user OTP/phone logins from complex business role-based access control (RBAC).
3. **Independent Scaling:** Allows DevOps to scale up infrastructure for the `user-app` during peak transactional traffic (like Friday nights) without wasting resources or money spinning up unneeded instances for the `merchant-app`.