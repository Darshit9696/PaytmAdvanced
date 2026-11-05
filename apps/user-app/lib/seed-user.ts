import { prisma } from "@repo/db/client";
import { NotificationType, OnRampStatus } from "@prisma/client";
import crypto from "crypto";

/**
 * Automatically injects authentic, active starter data for newly created user accounts.
 * This guarantees the personal dashboard immediately displays:
 * - Active Monthly Spending & Income KPIs
 * - Populated expense categories (Food, Shopping, Travel, Entertainment)
 * - Dynamic Daily & Weekly cash flow charts
 * - Top Contacts & Quick Transfers
 * - Notification bell alerts and On-Ramp deposit history
 */
export async function seedUserData(userId: number) {
  // 1. Guard against duplicate injection
  const existingTxCount = await prisma.transaction.count({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
  });

  if (existingTxCount > 0) {
    return; // Already has transactions, no need to inject
  }

  // 2. Fetch or create partner contacts for realistic P2P interactions
  let partners = await prisma.user.findMany({
    where: { id: { not: userId } },
    take: 5,
    select: { id: true, name: true, number: true },
    orderBy: { id: "asc" },
  });

  // Fallback if no other users exist in the database yet
  if (partners.length === 0) {
    const defaultPartner = await prisma.user.create({
      data: {
        name: "Rahul Verma",
        number: "7654321098",
        email: "rahul@paypulse.demo",
        password: "$2b$10$demoHashedPasswordDummyString1234567890",
        bankAccount: {
          create: {
            accountNumber: "ACC" + Math.floor(100000000000 + Math.random() * 900000000000),
            balance: 50000,
            bankName: "HDFC",
          },
        },
        wallet: {
          create: {
            balance: 15000,
          },
        },
      },
      select: { id: true, name: true, number: true },
    });
    partners = [defaultPartner];
  }

  const p1 = partners[0];
  const p2 = partners[1] || partners[0];
  const p3 = partners[2] || partners[0];
  const p4 = partners[3] || partners[0];

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Helper: date strictly inside current calendar month (for monthly KPIs, categories, daily chart)
  const inCurrentMonth = (daysAgo: number, hour: number = 12, min: number = 30) => {
    const day = Math.max(1, currentDay - daysAgo);
    return new Date(currentYear, currentMonth, day, hour, min, 0, 0);
  };

  // Helper: date across past weeks (for 8-week weekly velocity chart)
  const inPastWeeks = (daysAgo: number, hour: number = 15, min: number = 0) => {
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    d.setHours(hour, min, 0, 0);
    return d;
  };

  // 3. Transactions List
  const transactionsToInsert = [
    // --- Current Month Outgoing (Spending) ---
    {
      senderId: userId,
      receiverId: p1.id,
      amount: 350,
      note: "Campus cafeteria lunch split",
      category: "Food",
      createdAt: inCurrentMonth(0, Math.max(now.getHours() - 1, 9), 15),
    },
    {
      senderId: userId,
      receiverId: p2.id,
      amount: 180,
      note: "Cold coffee & brownies",
      category: "Food",
      createdAt: inCurrentMonth(0, Math.max(now.getHours() - 3, 8), 45),
    },
    {
      senderId: userId,
      receiverId: p3.id,
      amount: 450,
      note: "Uber ride to station",
      category: "Travel",
      createdAt: inCurrentMonth(1, 14, 20),
    },
    {
      senderId: userId,
      receiverId: p1.id,
      amount: 1499,
      note: "Wireless earbuds accessory",
      category: "Shopping",
      createdAt: inCurrentMonth(2, 16, 40),
    },
    {
      senderId: userId,
      receiverId: p4.id,
      amount: 650,
      note: "Weekend movie tickets - IMAX",
      category: "Entertainment",
      createdAt: inCurrentMonth(4, 18, 10),
    },
    {
      senderId: userId,
      receiverId: p2.id,
      amount: 500,
      note: "Monthly metro card recharge",
      category: "Travel",
      createdAt: inCurrentMonth(6, 11, 0),
    },
    {
      senderId: userId,
      receiverId: p3.id,
      amount: 1200,
      note: "University books & study pack",
      category: "Shopping",
      createdAt: inCurrentMonth(10, 15, 30),
    },
    {
      senderId: userId,
      receiverId: p4.id,
      amount: 750,
      note: "Arcade gaming pass chip-in",
      category: "Entertainment",
      createdAt: inCurrentMonth(14, 19, 0),
    },

    // --- Current Month Incoming (Income) ---
    {
      senderId: p2.id,
      receiverId: userId,
      amount: 2500,
      note: "Project collaboration stipend",
      category: "Shopping",
      createdAt: inCurrentMonth(0, Math.max(now.getHours() - 4, 7), 30),
    },
    {
      senderId: p1.id,
      receiverId: userId,
      amount: 750,
      note: "Returned lunch split share",
      category: "Food",
      createdAt: inCurrentMonth(1, 12, 10),
    },
    {
      senderId: p3.id,
      receiverId: userId,
      amount: 1200,
      note: "Concert ticket reimbursement",
      category: "Entertainment",
      createdAt: inCurrentMonth(3, 17, 25),
    },
    {
      senderId: p2.id,
      receiverId: userId,
      amount: 1800,
      note: "Freelance design gig settlement",
      category: "Shopping",
      createdAt: inCurrentMonth(8, 10, 15),
    },

    // --- Multi-week History (Populates 8-week cashflow velocity chart) ---
    {
      senderId: userId,
      receiverId: p1.id,
      amount: 850,
      note: "Dinner at BBQ Nation",
      category: "Food",
      createdAt: inPastWeeks(21, 20, 0),
    },
    {
      senderId: p4.id,
      receiverId: userId,
      amount: 2000,
      note: "Festival celebration reimbursement",
      category: "Entertainment",
      createdAt: inPastWeeks(23, 13, 0),
    },
    {
      senderId: userId,
      receiverId: p3.id,
      amount: 1100,
      note: "Sneakers chip-in split",
      category: "Shopping",
      createdAt: inPastWeeks(28, 16, 0),
    },
    {
      senderId: p1.id,
      receiverId: userId,
      amount: 1500,
      note: "Past semester group project share",
      category: "Education",
      createdAt: inPastWeeks(35, 11, 0),
    },
  ];

  // 4. Insert transactions and paired double-entry ledger records
  const involvedUserIds = Array.from(new Set([userId, ...partners.map((p) => p.id)]));
  const userWallets = await prisma.wallet.findMany({
    where: {
      userId: { in: involvedUserIds },
    },
    select: { id: true, userId: true },
  });
  const walletMap = new Map(userWallets.map((w) => [w.userId, w.id]));

  for (const t of transactionsToInsert) {
    const txn = await prisma.transaction.create({ data: t });
    const senderW = walletMap.get(t.senderId);
    const receiverW = walletMap.get(t.receiverId);
    if (senderW && receiverW) {
      await prisma.ledgerEntry.createMany({
        data: [
          {
            transactionId: txn.id,
            walletId: senderW,
            direction: "DEBIT",
            amount: t.amount,
            createdAt: t.createdAt,
          },
          {
            transactionId: txn.id,
            walletId: receiverW,
            direction: "CREDIT",
            amount: t.amount,
            createdAt: t.createdAt,
          },
        ],
      });
    }
  }

  // 5. Insert starter On-Ramp transaction (Bank deposit)
  const existingOnRamp = await prisma.onRampTransaction.findFirst({
    where: { userId },
  });

  if (!existingOnRamp) {
    await prisma.onRampTransaction.create({
      data: {
        userId,
        token: crypto.randomUUID(),
        amount: 10000,
        provider: "HDFC NetBanking",
        status: OnRampStatus.Success,
        startTime: inCurrentMonth(3, 10, 15),
      },
    });
  }

  // 6. Insert starter notifications
  const existingNotifications = await prisma.notification.count({
    where: { userId },
  });

  if (existingNotifications === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId,
          type: NotificationType.TRANSFER_RECEIVED,
          title: "Welcome Bonus Credited",
          message: "₹10,000 has been credited to your PayPulse digital wallet.",
          isRead: false,
          createdAt: inCurrentMonth(1, 9, 0),
        },
        {
          userId,
          type: NotificationType.TRANSFER_RECEIVED,
          title: "Payment Received",
          message: `You have successfully received ₹2,500 from ${p2.name}.`,
          isRead: false,
          createdAt: inCurrentMonth(0, Math.max(now.getHours() - 4, 7), 35),
        },
        {
          userId,
          type: NotificationType.TRANSFER_SENT,
          title: "Transfer Successful",
          message: `You have successfully sent ₹350 to ${p1.name} for lunch split.`,
          isRead: false,
          createdAt: inCurrentMonth(0, Math.max(now.getHours() - 1, 9), 20),
        },
      ],
    });
  }

  // 7. Update wallet balance to a healthy consistent demo amount (₹18,500)
  await prisma.wallet.updateMany({
    where: { userId },
    data: { balance: 18500 },
  });
}
