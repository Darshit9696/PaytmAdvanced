-- Conditional, idempotent forward migration to reconcile LedgerEntry -> ledger_entries rename

-- 1. Conditionally rename table: "LedgerEntry" -> "ledger_entries"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'LedgerEntry'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'ledger_entries'
  ) THEN
    ALTER TABLE "LedgerEntry" RENAME TO "ledger_entries";
  END IF;
END $$;

-- 2. Conditionally rename Primary Key constraint: "LedgerEntry_pkey" -> "ledger_entries_pkey"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'ledger_entries' AND c.conname = 'LedgerEntry_pkey'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'ledger_entries' AND c.conname = 'ledger_entries_pkey'
  ) THEN
    ALTER TABLE "ledger_entries" RENAME CONSTRAINT "LedgerEntry_pkey" TO "ledger_entries_pkey";
  END IF;
END $$;

-- 3. Conditionally rename Foreign Key on transactionId: "LedgerEntry_transactionId_fkey" -> "ledger_entries_transactionId_fkey"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'ledger_entries' AND c.conname = 'LedgerEntry_transactionId_fkey'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'ledger_entries' AND c.conname = 'ledger_entries_transactionId_fkey'
  ) THEN
    ALTER TABLE "ledger_entries" RENAME CONSTRAINT "LedgerEntry_transactionId_fkey" TO "ledger_entries_transactionId_fkey";
  END IF;
END $$;

-- 4. Conditionally rename Foreign Key on walletId: "LedgerEntry_walletId_fkey" -> "ledger_entries_walletId_fkey"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'ledger_entries' AND c.conname = 'LedgerEntry_walletId_fkey'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'ledger_entries' AND c.conname = 'ledger_entries_walletId_fkey'
  ) THEN
    ALTER TABLE "ledger_entries" RENAME CONSTRAINT "LedgerEntry_walletId_fkey" TO "ledger_entries_walletId_fkey";
  END IF;
END $$;

-- 5. Conditionally rename Unique Index on (transactionId, walletId): "LedgerEntry_transactionId_walletId_key" -> "ledger_entries_transactionId_walletId_key"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'LedgerEntry_transactionId_walletId_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'ledger_entries_transactionId_walletId_key'
  ) THEN
    ALTER INDEX "LedgerEntry_transactionId_walletId_key" RENAME TO "ledger_entries_transactionId_walletId_key";
  END IF;
END $$;
