const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

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

let PrismaClient;
try {
  PrismaClient = require("@prisma/client").PrismaClient;
} catch (e) {
  PrismaClient = require(path.join(__dirname, "..", "..", "node_modules", "@prisma", "client")).PrismaClient;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function runSeed() {
  console.log("=====================================================================");
  console.log("🚀 PAYPULSE SIMULATOR: SEEDING DEMO ACCOUNTS & STARTER DATA");
  console.log("   Notice: Educational prototype only. Virtual test balances only.");
  console.log("=====================================================================\n");

  const hashedPassword = await bcrypt.hash("demo123", 10);

  // 1. Define standard Demo Users
  const demoUsersConfig = [
    {
      phone: "9876543210",
      name: "Aryan Patel (Demo User)",
      email: "aryan@paypulse.demo",
      walletBalance: 18500,
      bankAccount: {
        accountNumber: "ACC123456789012",
        bankName: "HDFC",
        balance: 50000,
      },
      role: "PRIMARY_USER",
    },
    {
      phone: "8765432109",
      name: "Neha Sharma (Demo Peer)",
      email: "neha@paypulse.demo",
      walletBalance: 12400,
      bankAccount: {
        accountNumber: "ACC987654321098",
        bankName: "ICICI",
        balance: 40000,
      },
      role: "PEER_USER",
    },
    {
      phone: "7654321098",
      name: "Rahul Verma (Demo Peer)",
      email: "rahul@paypulse.demo",
      walletBalance: 8500,
      bankAccount: {
        accountNumber: "ACC112233445566",
        bankName: "SBI",
        balance: 30000,
      },
      role: "PEER_USER",
    },
    {
      phone: "6543210987",
      name: "Priya Mehta (Demo Peer)",
      email: "priya@paypulse.demo",
      walletBalance: 9500,
      bankAccount: {
        accountNumber: "ACC445566778899",
        bankName: "Axis",
        balance: 25000,
      },
      role: "PEER_USER",
    },
  ];

  console.log("👤 Ensuring demo consumer user accounts exist...");
  const seededUsers = [];

  for (const cfg of demoUsersConfig) {
    let user = await prisma.user.findUnique({
      where: { number: cfg.phone },
      include: { wallet: true, bankAccount: true },
    });

    // Check if email is already taken by another user
    const existingWithEmail = await prisma.user.findUnique({
      where: { email: cfg.email },
    });
    const safeEmail =
      !existingWithEmail || (user && existingWithEmail.id === user.id)
        ? cfg.email
        : user?.email || `user.${cfg.phone}@paypulse.demo`;

    if (!user) {
      user = await prisma.user.create({
        data: {
          number: cfg.phone,
          name: cfg.name,
          email: safeEmail,
          password: hashedPassword,
          wallet: {
            create: {
              balance: cfg.walletBalance,
            },
          },
          bankAccount: {
            create: cfg.bankAccount,
          },
        },
        include: { wallet: true, bankAccount: true },
      });
      console.log(`  ✅ Created demo user: ${cfg.name} (Phone: ${cfg.phone})`);
    } else {
      // Ensure password and name are updated to demo defaults
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: cfg.name,
          email: safeEmail,
          password: hashedPassword,
        },
        include: { wallet: true, bankAccount: true },
      });

      // Ensure wallet exists
      if (!user.wallet) {
        await prisma.wallet.create({
          data: {
            userId: user.id,
            balance: cfg.walletBalance,
          },
        });
      } else if (user.wallet.balance < 5000) {
        await prisma.wallet.update({
          where: { id: user.wallet.id },
          data: { balance: cfg.walletBalance },
        });
      }

      // Ensure bank account exists
      if (!user.bankAccount) {
        await prisma.bankAccount.create({
          data: {
            userId: user.id,
            accountNumber: cfg.bankAccount.accountNumber,
            bankName: cfg.bankAccount.bankName,
            balance: cfg.bankAccount.balance,
          },
        });
      }

      console.log(`  🔄 Synchronized demo user: ${cfg.name} (Phone: ${cfg.phone})`);
    }

    seededUsers.push(user);
  }

  // 2. Define standard Demo Merchants
  const demoMerchantsConfig = [
    {
      businessName: "Apex Electronics & Retail (Demo)",
      ownerName: "Rajesh Keshwala",
      email: "merchant@paypulse.demo",
      phone: "9876500001",
      balance: 25000,
    },
    {
      businessName: "Campus Cafe & Lounge (Demo)",
      ownerName: "Priya Mehta",
      email: "cafe@paypulse.demo",
      phone: "9876500002",
      balance: 15000,
    },
  ];

  console.log("\n🏪 Ensuring demo merchant accounts exist...");
  const seededMerchants = [];

  for (const mCfg of demoMerchantsConfig) {
    let merchant = await prisma.merchant.findUnique({
      where: { email: mCfg.email },
    });

    if (!merchant) {
      merchant = await prisma.merchant.create({
        data: {
          businessName: mCfg.businessName,
          ownerName: mCfg.ownerName,
          email: mCfg.email,
          phone: mCfg.phone,
          password: hashedPassword,
          balance: mCfg.balance,
        },
      });
      console.log(`  ✅ Created demo merchant: ${mCfg.businessName} (Email: ${mCfg.email})`);
    } else {
      merchant = await prisma.merchant.update({
        where: { id: merchant.id },
        data: {
          businessName: mCfg.businessName,
          ownerName: mCfg.ownerName,
          phone: mCfg.phone,
          password: hashedPassword,
          balance: Math.max(merchant.balance, mCfg.balance),
        },
      });
      console.log(`  🔄 Synchronized demo merchant: ${mCfg.businessName} (Email: ${mCfg.email})`);
    }

    // Ensure corresponding User record exists for checkout payments
    let merchantUser = await prisma.user.findFirst({
      where: {
        OR: [{ number: mCfg.phone }, { email: mCfg.email }],
      },
    });

    if (!merchantUser) {
      const emailTakenInUser = await prisma.user.findUnique({ where: { email: mCfg.email } });
      const safeMerchantUserEmail = emailTakenInUser ? `biz.${mCfg.phone}@paypulse.demo` : mCfg.email;
      merchantUser = await prisma.user.create({
        data: {
          name: mCfg.businessName,
          number: mCfg.phone,
          email: safeMerchantUserEmail,
          password: hashedPassword,
        },
      });
      console.log(`  🔗 Linked merchant user counterpart: ${mCfg.businessName}`);
    }

    seededMerchants.push(merchant);
  }

  // 3. Inject realistic starter activity for primary demo user
  const primaryUser = seededUsers[0];
  const p1 = seededUsers[1];
  const p2 = seededUsers[2];
  const p3 = seededUsers[3];

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

  const primaryTxnCount = await prisma.transaction.count({
    where: {
      OR: [{ senderId: primaryUser.id }, { receiverId: primaryUser.id }],
    },
  });

  if (primaryTxnCount < 5) {
    console.log(`\n💳 Injecting transaction history and ledger records for ${primaryUser.name}...`);

    const txns = [
      {
        senderId: primaryUser.id,
        receiverId: p1.id,
        amount: 350,
        note: "Campus cafeteria lunch split",
        category: "Food",
        createdAt: inCurrentMonth(0, Math.max(now.getHours() - 1, 9), 15),
      },
      {
        senderId: primaryUser.id,
        receiverId: p2.id,
        amount: 180,
        note: "Cold coffee & brownies",
        category: "Food",
        createdAt: inCurrentMonth(0, Math.max(now.getHours() - 3, 8), 45),
      },
      {
        senderId: primaryUser.id,
        receiverId: p3.id,
        amount: 450,
        note: "Uber ride to station",
        category: "Travel",
        createdAt: inCurrentMonth(1, 14, 20),
      },
      {
        senderId: primaryUser.id,
        receiverId: p1.id,
        amount: 1499,
        note: "Wireless earbuds accessory",
        category: "Shopping",
        createdAt: inCurrentMonth(2, 16, 40),
      },
      {
        senderId: primaryUser.id,
        receiverId: p3.id,
        amount: 650,
        note: "Weekend movie tickets - IMAX",
        category: "Entertainment",
        createdAt: inCurrentMonth(4, 18, 10),
      },
      {
        senderId: primaryUser.id,
        receiverId: p2.id,
        amount: 500,
        note: "Monthly metro card recharge",
        category: "Travel",
        createdAt: inCurrentMonth(6, 11, 0),
      },
      {
        senderId: primaryUser.id,
        receiverId: p3.id,
        amount: 1200,
        note: "University books & study pack",
        category: "Shopping",
        createdAt: inCurrentMonth(10, 15, 30),
      },
      {
        senderId: p2.id,
        receiverId: primaryUser.id,
        amount: 2500,
        note: "Project collaboration stipend",
        category: "Shopping",
        createdAt: inCurrentMonth(0, Math.max(now.getHours() - 4, 7), 30),
      },
      {
        senderId: p1.id,
        receiverId: primaryUser.id,
        amount: 750,
        note: "Returned lunch split share",
        category: "Food",
        createdAt: inCurrentMonth(1, 12, 10),
      },
      {
        senderId: p3.id,
        receiverId: primaryUser.id,
        amount: 1800,
        note: "Freelance design gig settlement",
        category: "Shopping",
        createdAt: inCurrentMonth(8, 10, 15),
      },
      {
        senderId: primaryUser.id,
        receiverId: p1.id,
        amount: 850,
        note: "Dinner at BBQ Nation",
        category: "Food",
        createdAt: inPastWeeks(21, 20, 0),
      },
      {
        senderId: p2.id,
        receiverId: primaryUser.id,
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

    // On-ramp deposit for primary user
    const existingOnRamp = await prisma.onRampTransaction.findFirst({
      where: { userId: primaryUser.id },
    });
    if (!existingOnRamp) {
      await prisma.onRampTransaction.create({
        data: {
          userId: primaryUser.id,
          token: crypto.randomUUID(),
          amount: 10000,
          provider: "HDFC NetBanking",
          status: "Success",
          startTime: inCurrentMonth(3, 10, 15),
        },
      });
    }

    // Starter notifications
    const notifs = await prisma.notification.count({ where: { userId: primaryUser.id } });
    if (notifs === 0) {
      await prisma.notification.createMany({
        data: [
          {
            userId: primaryUser.id,
            type: "TRANSFER_RECEIVED",
            title: "Welcome Bonus Credited",
            message: "₹10,000 has been credited to your PayPulse digital wallet.",
            isRead: false,
            createdAt: inCurrentMonth(1, 9, 0),
          },
          {
            userId: primaryUser.id,
            type: "TRANSFER_RECEIVED",
            title: "Payment Received",
            message: `You have successfully received ₹2,500 from ${p2.name}.`,
            isRead: false,
            createdAt: inCurrentMonth(0, Math.max(now.getHours() - 4, 7), 35),
          },
          {
            userId: primaryUser.id,
            type: "TRANSFER_SENT",
            title: "Transfer Successful",
            message: `You have successfully sent ₹350 to ${p1.name} for lunch split.`,
            isRead: false,
            createdAt: inCurrentMonth(0, Math.max(now.getHours() - 1, 9), 20),
          },
        ],
      });
    }

    console.log(`  ✅ Transactions, double-entry ledger, and notifications seeded for ${primaryUser.name}.`);
  }

  // 4. Ensure demo merchants have sample checkout transactions
  for (const merchant of seededMerchants) {
    const txCount = await prisma.merchantTransaction.count({
      where: { merchantId: merchant.id },
    });

    if (txCount < 3) {
      console.log(`📦 Injecting merchant checkout transactions for ${merchant.businessName}...`);
      await prisma.merchantTransaction.createMany({
        data: [
          {
            transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            merchantId: merchant.id,
            customerId: primaryUser.id,
            amount: 1450,
            note: "Store QR checkout payment",
            status: "SUCCESS",
            createdAt: inCurrentMonth(0, 14, 30),
          },
          {
            transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            merchantId: merchant.id,
            customerId: p1.id,
            amount: 2800,
            note: "Retail accessory purchase",
            status: "SUCCESS",
            createdAt: inCurrentMonth(1, 16, 45),
          },
          {
            transactionId: `TXN-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            merchantId: merchant.id,
            customerId: primaryUser.id,
            amount: 750,
            note: "Awaiting customer authorization",
            status: "PENDING",
            createdAt: inCurrentMonth(0, 15, 10),
          },
        ],
      });
      console.log(`  ✅ Merchant checkout transactions seeded for ${merchant.businessName}.`);
    }
  }

  console.log("\n=====================================================================");
  console.log("✨ DEMO CREDENTIALS READY (NO SIGN UP REQUIRED)");
  console.log("=====================================================================");
  console.log("📱 CONSUMER WALLET PORTAL (http://localhost:3000/login)");
  console.log("   • Primary Demo User:");
  console.log("       Phone:    9876543210");
  console.log("       Password: demo123");
  console.log("       Name:     Aryan Patel (Demo User)");
  console.log("       Balance:  ₹18,500 (Wallet) | ₹50,000 (HDFC Bank)");
  console.log("");
  console.log("   • Peer User (Ready Transfer Recipient):");
  console.log("       Phone:    8765432109");
  console.log("       Password: demo123");
  console.log("       Name:     Neha Sharma (Demo Peer)");
  console.log("       Balance:  ₹12,400 (Wallet) | ₹40,000 (ICICI Bank)");
  console.log("");
  console.log("🏪 MERCHANT BUSINESS PORTAL (http://localhost:3002/login)");
  console.log("   • Primary Demo Merchant:");
  console.log("       Email:    merchant@paypulse.demo");
  console.log("       Password: demo123");
  console.log("       Business: Apex Electronics & Retail (Demo)");
  console.log("       Balance:  ₹25,000");
  console.log("");
  console.log("   • Secondary Demo Merchant:");
  console.log("       Email:    cafe@paypulse.demo");
  console.log("       Password: demo123");
  console.log("       Business: Campus Cafe & Lounge (Demo)");
  console.log("       Balance:  ₹15,000");
  console.log("=====================================================================\n");
}

runSeed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
