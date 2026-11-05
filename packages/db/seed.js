const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// 1. Locate and parse DATABASE_URL
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  const envPaths = [
    path.join(__dirname, ".env"),
    path.join(__dirname, "..", "..", ".env"),
    path.join(__dirname, "..", "..", "apps", "user-app", ".env.local"),
  ];

  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("DATABASE_URL=")) {
          let val = trimmed.substring("DATABASE_URL=".length).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          dbUrl = val;
          break;
        }
      }
      if (dbUrl) break;
    }
  }
}

if (dbUrl) {
  dbUrl = dbUrl.replace(/[?&]channel_binding=require/g, "");
}

const { PrismaClient } = require(path.join(__dirname, "..", "..", "node_modules", "@prisma", "client"));
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function runSeed() {
  console.log("🚀 Running PayPulse Database Seeder / Backfill...\n");

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      number: true,
      _count: {
        select: {
          sentTransactions: true,
          receivedTransactions: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  console.log(`Found ${allUsers.length} total users in database.`);

  const zeroTxUsers = allUsers.filter(
    (u) => u._count.sentTransactions === 0 && u._count.receivedTransactions === 0
  );

  console.log(
    `Users without transactions (need data injection): ${
      zeroTxUsers.length > 0
        ? zeroTxUsers.map((u) => `${u.name} (ID: ${u.id})`).join(", ")
        : "None"
    }\n`
  );

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const inCurrentMonth = (daysAgo, hour = 12, min = 30) => {
    const day = Math.max(1, currentDay - daysAgo);
    return new Date(currentYear, currentMonth, day, hour, min, 0, 0);
  };

  const inPastWeeks = (daysAgo, hour = 15, min = 0) => {
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    d.setHours(hour, min, 0, 0);
    return d;
  };

  // Seed data for each user missing transactions
  for (const emptyUser of zeroTxUsers) {
    console.log(`📦 Injecting realistic activity for ${emptyUser.name} (ID: ${emptyUser.id})...`);

    const partners = allUsers.filter((u) => u.id !== emptyUser.id);
    const p1 = partners[0] || { id: emptyUser.id, name: "Rahul Verma" };
    const p2 = partners[1] || partners[0];
    const p3 = partners[2] || partners[0];
    const p4 = partners[3] || partners[0];

    const txns = [
      {
        senderId: emptyUser.id,
        receiverId: p1.id,
        amount: 350,
        note: "Campus cafeteria lunch split",
        category: "Food",
        createdAt: inCurrentMonth(0, Math.max(now.getHours() - 1, 9), 15),
      },
      {
        senderId: emptyUser.id,
        receiverId: p2.id,
        amount: 180,
        note: "Cold coffee & brownies",
        category: "Food",
        createdAt: inCurrentMonth(0, Math.max(now.getHours() - 3, 8), 45),
      },
      {
        senderId: emptyUser.id,
        receiverId: p3.id,
        amount: 450,
        note: "Uber ride to station",
        category: "Travel",
        createdAt: inCurrentMonth(1, 14, 20),
      },
      {
        senderId: emptyUser.id,
        receiverId: p1.id,
        amount: 1499,
        note: "Wireless earbuds accessory",
        category: "Shopping",
        createdAt: inCurrentMonth(2, 16, 40),
      },
      {
        senderId: emptyUser.id,
        receiverId: p4.id,
        amount: 650,
        note: "Weekend movie tickets - IMAX",
        category: "Entertainment",
        createdAt: inCurrentMonth(4, 18, 10),
      },
      {
        senderId: emptyUser.id,
        receiverId: p2.id,
        amount: 500,
        note: "Monthly metro card recharge",
        category: "Travel",
        createdAt: inCurrentMonth(6, 11, 0),
      },
      {
        senderId: emptyUser.id,
        receiverId: p3.id,
        amount: 1200,
        note: "University books & study pack",
        category: "Shopping",
        createdAt: inCurrentMonth(10, 15, 30),
      },
      {
        senderId: emptyUser.id,
        receiverId: p4.id,
        amount: 750,
        note: "Arcade gaming pass chip-in",
        category: "Entertainment",
        createdAt: inCurrentMonth(14, 19, 0),
      },
      {
        senderId: p2.id,
        receiverId: emptyUser.id,
        amount: 2500,
        note: "Project collaboration stipend",
        category: "Shopping",
        createdAt: inCurrentMonth(0, Math.max(now.getHours() - 4, 7), 30),
      },
      {
        senderId: p1.id,
        receiverId: emptyUser.id,
        amount: 750,
        note: "Returned lunch split share",
        category: "Food",
        createdAt: inCurrentMonth(1, 12, 10),
      },
      {
        senderId: p3.id,
        receiverId: emptyUser.id,
        amount: 1200,
        note: "Concert ticket reimbursement",
        category: "Entertainment",
        createdAt: inCurrentMonth(3, 17, 25),
      },
      {
        senderId: p2.id,
        receiverId: emptyUser.id,
        amount: 1800,
        note: "Freelance design gig settlement",
        category: "Shopping",
        createdAt: inCurrentMonth(8, 10, 15),
      },
      {
        senderId: emptyUser.id,
        receiverId: p1.id,
        amount: 850,
        note: "Dinner at BBQ Nation",
        category: "Food",
        createdAt: inPastWeeks(21, 20, 0),
      },
      {
        senderId: p4.id,
        receiverId: emptyUser.id,
        amount: 2000,
        note: "Festival celebration reimbursement",
        category: "Entertainment",
        createdAt: inPastWeeks(23, 13, 0),
      },
    ];

    const allWallets = await prisma.wallet.findMany({ select: { id: true, userId: true } });
    const walletMap = new Map(allWallets.map((w) => [w.userId, w.id]));

    for (const t of txns) {
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

    // On-ramp deposit
    const onRamp = await prisma.onRampTransaction.findFirst({ where: { userId: emptyUser.id } });
    if (!onRamp) {
      await prisma.onRampTransaction.create({
        data: {
          userId: emptyUser.id,
          token: crypto.randomUUID(),
          amount: 10000,
          provider: "HDFC NetBanking",
          status: "Success",
          startTime: inCurrentMonth(3, 10, 15),
        },
      });
    }

    // Notifications
    const notifs = await prisma.notification.count({ where: { userId: emptyUser.id } });
    if (notifs === 0) {
      await prisma.notification.createMany({
        data: [
          {
            userId: emptyUser.id,
            type: "TRANSFER_RECEIVED",
            title: "Welcome Bonus Credited",
            message: "₹10,000 has been credited to your PayPulse digital wallet.",
            isRead: false,
            createdAt: inCurrentMonth(1, 9, 0),
          },
          {
            userId: emptyUser.id,
            type: "TRANSFER_RECEIVED",
            title: "Payment Received",
            message: `You have successfully received ₹2,500 from ${p2.name}.`,
            isRead: false,
            createdAt: inCurrentMonth(0, Math.max(now.getHours() - 4, 7), 35),
          },
          {
            userId: emptyUser.id,
            type: "TRANSFER_SENT",
            title: "Transfer Successful",
            message: `You have successfully sent ₹350 to ${p1.name} for lunch split.`,
            isRead: false,
            createdAt: inCurrentMonth(0, Math.max(now.getHours() - 1, 9), 20),
          },
        ],
      });
    }

    // Update wallet balance to ₹18,500
    await prisma.wallet.updateMany({
      where: { userId: emptyUser.id },
      data: { balance: 18500 },
    });

    console.log(`  ✅ Done for ${emptyUser.name}.`);
  }

  // Also check merchants without transactions
  console.log("\n🏪 Checking Merchants...");
  const merchants = await prisma.merchant.findMany({
    select: {
      id: true,
      businessName: true,
      _count: {
        select: { merchantTransactions: true },
      },
    },
  });

  const zeroTxMerchants = merchants.filter((m) => m._count.merchantTransactions === 0);
  for (const m of zeroTxMerchants) {
    console.log(`📦 Injecting starter transactions for merchant: ${m.businessName} (ID: ${m.id})...`);
    const c1 = allUsers[0]?.id || null;
    const c2 = allUsers[1]?.id || null;

    await prisma.merchantTransaction.createMany({
      data: [
        {
          transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          merchantId: m.id,
          customerId: c1,
          amount: 1450,
          note: "Store QR checkout payment",
          status: "SUCCESS",
          createdAt: inCurrentMonth(0, 14, 30),
        },
        {
          transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          merchantId: m.id,
          customerId: c2,
          amount: 2800,
          note: "Electronics accessory sale",
          status: "SUCCESS",
          createdAt: inCurrentMonth(1, 16, 45),
        },
        {
          transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          merchantId: m.id,
          customerId: c1,
          amount: 750,
          note: "Awaiting customer authorization",
          status: "PENDING",
          createdAt: inCurrentMonth(0, 15, 10),
        },
      ],
    });

    await prisma.merchant.update({
      where: { id: m.id },
      data: { balance: 25000 },
    });
    console.log(`  ✅ Done for merchant ${m.businessName}.`);
  }

  console.log("\n✨ Database seeding / backfill completed successfully!");
}

runSeed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
