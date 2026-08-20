-- DropForeignKey
ALTER TABLE "MerchantTransaction" DROP CONSTRAINT "MerchantTransaction_customerId_fkey";

-- AlterTable
ALTER TABLE "MerchantTransaction" ADD COLUMN     "note" TEXT,
ALTER COLUMN "customerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MerchantTransaction" ADD CONSTRAINT "MerchantTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
