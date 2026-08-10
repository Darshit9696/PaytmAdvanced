ALTER TABLE "OffRampTransaction"
ADD COLUMN "token" TEXT NOT NULL;

CREATE UNIQUE INDEX "OffRampTransaction_token_key"
ON "OffRampTransaction"("token");