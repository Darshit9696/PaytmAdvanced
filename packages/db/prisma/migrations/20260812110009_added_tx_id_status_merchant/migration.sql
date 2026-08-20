/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `MerchantTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `MerchantTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "MerchantTransaction" ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transactionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MerchantTransaction_transactionId_key" ON "MerchantTransaction"("transactionId");
