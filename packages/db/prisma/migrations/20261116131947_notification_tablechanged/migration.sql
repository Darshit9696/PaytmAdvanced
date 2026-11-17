/*
  Warnings:

  - A unique constraint covering the columns `[eventId,userId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Notification_eventId_userId_key" ON "Notification"("eventId", "userId");
