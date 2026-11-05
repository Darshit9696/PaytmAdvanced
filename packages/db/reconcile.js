const path = require("path");
const fs = require("fs");

// 1. Locate and parse DATABASE_URL if not already in env
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

async function runReconciliation() {
  const args = process.argv.slice(2);
  const shouldAutoFix = args.includes("--fix");
  const shouldBackfill = args.includes("--backfill");
  const asJson = args.includes("--json");

  if (!asJson) {
    console.log("\n=======================================================");
    console.log("🚀 PAYPULSE LEDGER RECONCILIATION JOB");
    console.log("=======================================================\n");
  }

  // 1. Backfill historical transactions if requested
  if (shouldBackfill) {
    if (!asJson) console.log("🔄 Checking for historical transactions missing ledger entries...");
    const allWallets = await prisma.wallet.findMany({ select: { id: true, userId: true } });
    const walletByUser = new Map(allWallets.map((w) => [w.userId, w.id]));

    const missingTxns = await prisma.transaction.findMany({
      where: {
        ledgerEntries: {
          none: {},
        },
      },
      orderBy: { id: "asc" },
    });

    if (missingTxns.length === 0) {
      if (!asJson) console.log("  ✅ All transactions already have ledger entries.\n");
    } else {
      if (!asJson) console.log(`  📦 Backfilling ${missingTxns.length} transactions into append-only ledger_entries...`);
      const entriesToCreate = [];
      let backfilled = 0;
      for (const txn of missingTxns) {
        const senderWalletId = walletByUser.get(txn.senderId);
        const receiverWalletId = walletByUser.get(txn.receiverId);
        if (!senderWalletId || !receiverWalletId) {
          if (!asJson) console.warn(`    ⚠️ Missing wallet for tx #${txn.id} (sender: ${txn.senderId}, receiver: ${txn.receiverId})`);
          continue;
        }

        entriesToCreate.push({
          transactionId: txn.id,
          walletId: senderWalletId,
          direction: "DEBIT",
          amount: txn.amount,
          createdAt: txn.createdAt,
        });
        entriesToCreate.push({
          transactionId: txn.id,
          walletId: receiverWalletId,
          direction: "CREDIT",
          amount: txn.amount,
          createdAt: txn.createdAt,
        });
        backfilled++;
      }

      if (entriesToCreate.length > 0) {
        await prisma.ledgerEntry.createMany({
          data: entriesToCreate,
          skipDuplicates: true,
        });
      }
      if (!asJson) console.log(`  ✅ Successfully backfilled ${backfilled} transactions (${entriesToCreate.length} ledger rows).\n`);
    }
  }

  // 2. Global Check: Debits Equal Credits
  const debitAgg = await prisma.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: { direction: "DEBIT" },
  });
  const creditAgg = await prisma.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: { direction: "CREDIT" },
  });

  const totalDebits = debitAgg._sum.amount ?? 0;
  const totalCredits = creditAgg._sum.amount ?? 0;
  const globalDiff = totalDebits - totalCredits;
  const isGlobalBalanced = globalDiff === 0;

  // 3. Per-Transaction Check
  const entriesByTx = await prisma.ledgerEntry.groupBy({
    by: ["transactionId", "direction"],
    _sum: { amount: true },
  });

  const txLegsMap = new Map();
  for (const group of entriesByTx) {
    const txId = group.transactionId;
    const existing = txLegsMap.get(txId) || { debit: 0, credit: 0 };
    const amt = group._sum.amount ?? 0;
    if (group.direction === "DEBIT") {
      existing.debit += amt;
    } else {
      existing.credit += amt;
    }
    txLegsMap.set(txId, existing);
  }

  const txIds = Array.from(txLegsMap.keys());
  const transactions = await prisma.transaction.findMany({
    where: { id: { in: txIds } },
    select: { id: true, amount: true },
  });
  const txAmountMap = new Map(transactions.map((t) => [t.id, t.amount]));

  const unbalancedTransactions = [];
  for (const [txId, legs] of txLegsMap.entries()) {
    const expected = txAmountMap.get(txId) ?? 0;
    if (legs.debit !== legs.credit || legs.debit !== expected) {
      unbalancedTransactions.push({
        transactionId: txId,
        debits: legs.debit,
        credits: legs.credit,
        expectedAmount: expected,
      });
    }
  }

  // 4. Per-Wallet Balance vs Ledger Sum Check
  const allWallets = await prisma.wallet.findMany({
    include: {
      user: { select: { id: true, name: true } },
      ledgerEntries: { select: { direction: true, amount: true } },
    },
    orderBy: { id: "asc" },
  });

  const discrepancies = [];
  let matchedWalletsCount = 0;

  for (const wallet of allWallets) {
    let credits = 0;
    let debits = 0;
    for (const entry of wallet.ledgerEntries) {
      if (entry.direction === "CREDIT") credits += entry.amount;
      else if (entry.direction === "DEBIT") debits += entry.amount;
    }

    const ledgerSum = credits - debits;
    const diff = wallet.balance - ledgerSum;

    if (diff !== 0) {
      let wasFixed = false;
      if (shouldAutoFix) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: ledgerSum },
        });
        wasFixed = true;
      }

      discrepancies.push({
        walletId: wallet.id,
        userId: wallet.userId,
        userName: wallet.user ? wallet.user.name : "Unknown",
        currentBalance: wallet.balance,
        ledgerSum,
        difference: diff,
        fixed: wasFixed,
      });
    } else {
      matchedWalletsCount++;
    }
  }

  const isFullyReconciled = isGlobalBalanced && unbalancedTransactions.length === 0 && discrepancies.length === 0;

  const report = {
    timestamp: new Date().toISOString(),
    status: isFullyReconciled ? "BALANCED" : "DISCREPANCY_DETECTED",
    globalCheck: {
      totalDebits,
      totalCredits,
      difference: globalDiff,
      isBalanced: isGlobalBalanced,
    },
    transactionCheck: {
      totalTransactionsAudited: txIds.length,
      unbalancedCount: unbalancedTransactions.length,
      unbalancedTransactions,
    },
    walletCheck: {
      totalWalletsAudited: allWallets.length,
      matchedCount: matchedWalletsCount,
      discrepancyCount: discrepancies.length,
      discrepancies,
    },
  };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("-------------------------------------------------------");
    console.log("1️⃣  GLOBAL DOUBLE-ENTRY AUDIT (DEBITS == CREDITS)");
    console.log("-------------------------------------------------------");
    console.log(`  Total Debits:     ₹${totalDebits.toLocaleString("en-IN")}`);
    console.log(`  Total Credits:    ₹${totalCredits.toLocaleString("en-IN")}`);
    console.log(`  Net Difference:   ₹${globalDiff}`);
    console.log(`  Integrity Status: ${isGlobalBalanced ? "✅ BALANCED (Debits equal Credits)" : "❌ FAILED (Imbalance detected)"}`);
    console.log();

    console.log("-------------------------------------------------------");
    console.log("2️⃣  TRANSACTION-LEVEL PAIR INTEGRITY");
    console.log("-------------------------------------------------------");
    console.log(`  Transactions Audited:    ${txIds.length}`);
    console.log(`  Unbalanced Transactions: ${unbalancedTransactions.length}`);
    if (unbalancedTransactions.length > 0) {
      unbalancedTransactions.forEach((u) => {
        console.log(`    ❌ Tx #${u.transactionId}: Debits=₹${u.debits}, Credits=₹${u.credits}, Expected=₹${u.expectedAmount}`);
      });
    } else {
      console.log("  ✅ All transaction legs are perfectly paired.");
    }
    console.log();

    console.log("-------------------------------------------------------");
    console.log("3️⃣  WALLET BALANCE VS LEDGER SUM AUDIT");
    console.log("-------------------------------------------------------");
    console.log(`  Wallets Audited:  ${allWallets.length}`);
    console.log(`  Matched Wallets:  ${matchedWalletsCount}`);
    console.log(`  Discrepancies:    ${discrepancies.length}`);

    if (discrepancies.length > 0) {
      console.log("\n  Discrepancy Details:");
      for (const d of discrepancies) {
        console.log(
          `   - User: ${d.userName} (ID: ${d.userId}, Wallet: ${d.walletId})\n` +
          `     Stated Balance: ₹${d.currentBalance.toLocaleString("en-IN")} | Ledger Sum: ₹${d.ledgerSum.toLocaleString("en-IN")} | Drift: ₹${d.difference.toLocaleString("en-IN")}${d.fixed ? " [AUTOMATICALLY SYNCED]" : ""}`
        );
      }
      if (!shouldAutoFix) {
        console.log("\n  💡 Tip: Run with --fix to automatically synchronize wallet balances to ledger sums.");
      }
    } else {
      console.log("  ✅ Every single wallet balance perfectly matches its ledger sum.");
    }

    console.log("\n=======================================================");
    console.log(`FINAL VERDICT: ${isFullyReconciled ? "🎉 SYSTEM 100% RECONCILED" : "⚠️ DISCREPANCIES PRESENT"}`);
    console.log("=======================================================\n");
  }

  return report;
}

runReconciliation()
  .catch((err) => {
    console.error("❌ Reconciliation job failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
