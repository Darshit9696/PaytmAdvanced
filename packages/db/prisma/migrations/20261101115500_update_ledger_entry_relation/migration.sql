-- DropIndex
DROP INDEX "LedgerEntry_transferId_walletId_key";

-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "transferId",
ADD COLUMN     "transactionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_transactionId_walletId_key" ON "LedgerEntry"("transactionId", "walletId");

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
