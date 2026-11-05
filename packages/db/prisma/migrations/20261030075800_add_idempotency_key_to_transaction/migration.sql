-- AlterTable: Add column as nullable first
ALTER TABLE "Transaction" ADD COLUMN "idempotencyKey" TEXT;

-- Backfill existing rows with unique legacy keys
UPDATE "Transaction" SET "idempotencyKey" = 'legacy_' || "id" WHERE "idempotencyKey" IS NULL;

-- AlterColumn: Make NOT NULL
ALTER TABLE "Transaction" ALTER COLUMN "idempotencyKey" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_senderId_idempotencyKey_key" ON "Transaction"("senderId", "idempotencyKey");
