import { prisma } from "@repo/db/client";
import { TransactionStatus } from "@prisma/client";
import crypto from "crypto";

/**
 * Automatically injects starter checkout transactions and active stats for newly created Merchant accounts.
 */
export async function seedMerchantData(merchantId: number) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);

  // 1. Guard against duplicate injection for active current month
  const currentMonthCount = await prisma.merchantTransaction.count({
    where: {
      merchantId,
      createdAt: { gte: startOfMonth },
    },
  });

  if (currentMonthCount >= 4) {
    return;
  }

  // 2. Fetch sample customer users
  const customers = await prisma.user.findMany({
    take: 4,
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });

  const c1 = customers[0]?.id || null;
  const c2 = customers[1]?.id || null;
  const c3 = customers[2]?.id || null;

  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(currentYear, currentMonth, currentDate + diffToMonday, 0, 0, 0, 0);

  // Helper: date relative to today
  const dateOffset = (daysAgo: number, hours: number = 14, mins: number = 0) => {
    const d = new Date(currentYear, currentMonth, currentDate - daysAgo, hours, mins, 0, 0);
    return d;
  };

  const merchantTxns = [
    {
      transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      merchantId,
      customerId: c1,
      amount: 1450,
      note: "Store QR checkout payment",
      status: TransactionStatus.SUCCESS,
      createdAt: dateOffset(0, Math.max(now.getHours() - 1, 9), 30),
    },
    {
      transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      merchantId,
      customerId: c2,
      amount: 450,
      note: "Beverages & snacks counter",
      status: TransactionStatus.SUCCESS,
      createdAt: dateOffset(0, Math.max(now.getHours() - 3, 8), 15),
    },
    {
      transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      merchantId,
      customerId: c3,
      amount: 2800,
      note: "Electronics accessory sale",
      status: TransactionStatus.SUCCESS,
      createdAt: dateOffset(1, 16, 45),
    },
    {
      transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      merchantId,
      customerId: c1,
      amount: 1950,
      note: "Express grocery checkout",
      status: TransactionStatus.SUCCESS,
      createdAt: dateOffset(2, 12, 10),
    },
    {
      transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      merchantId,
      customerId: c2,
      amount: 3200,
      note: "Bulk retail purchase",
      status: TransactionStatus.SUCCESS,
      createdAt: dateOffset(3, 15, 20),
    },
    {
      transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      merchantId,
      customerId: c3,
      amount: 750,
      note: "Awaiting customer OTP authorization",
      status: TransactionStatus.PENDING,
      createdAt: dateOffset(0, Math.max(now.getHours() - 1, 9), 50),
    },
  ];

  await prisma.merchantTransaction.createMany({
    data: merchantTxns,
  });

  // Set an active starter balance for the merchant
  await prisma.merchant.update({
    where: { id: merchantId },
    data: { balance: 25000 },
  });
}
