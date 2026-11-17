/*
  Warnings:

  - You are about to drop the column `processedAt` on the `outbox_events` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "outbox_events_processedAt_createdAt_idx";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "eventId" TEXT;

-- AlterTable
ALTER TABLE "outbox_events" DROP COLUMN "processedAt",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "outbox_events_publishedAt_createdAt_idx" ON "outbox_events"("publishedAt", "createdAt");
