import { prisma } from "./index";

// Every money transfer creates two rows in ledger_entries:

// a DEBIT on the sender’s wallet (money out)
// a CREDIT on the receiver’s wallet (money in)

// Both rows have the same amount. This gives you three things that must always be true:

// Globally, total debits = total credits.
// Per transaction, debit = credit = the transaction’s amount.
// Per wallet, wallet.balance = (sum of credits) − (sum of debits).
// 
// reconcileLedger checks exactly these three. If any fails, something went wrong (a bug, a crash mid-transfer, someone editing the DB by hand).
export interface ReconciliationReport {
  timestamp: string;
  status: "BALANCED" | "DISCREPANCY_DETECTED";
  globalCheck: {
    totalDebits: number;
    totalCredits: number;
    difference: number;
    isBalanced: boolean;
  };
  transactionCheck: {
    totalTransactionsChecked: number;
    unbalancedCount: number;
    unbalancedTransactions: Array<{
      transactionId: number;
      debits: number;
      credits: number;
      expectedAmount: number;
    }>;
  };
  walletCheck: {
    totalWalletsChecked: number;
    matchedWalletsCount: number;
    discrepancyCount: number;
    discrepancies: Array<{
      walletId: number;
      userId: number;
      userName: string;
      balance: number;
      ledgerSum: number;
      difference: number;
      fixed?: boolean;
    }>;
  };
}

export interface ReconcileOptions {
  autoFix?: boolean;
  verbose?: boolean;
}
export interface ReconcileOptions { autoFix?: boolean; verbose?: boolean }

// Legs is a small bucket holding the debit total and credit total for one thing 
// (a wallet, a transaction, or everything).
type Legs = { DEBIT: number; CREDIT: number };

// Row describes what a Prisma groupBy row looks like. _sum.amount can be null because 
// the sum of zero rows is null in SQL.
type Row = {
    direction: "DEBIT" | "CREDIT";
      _sum: 
      {
        amount: number | null 
      }
 };

/** Fold groupBy rows into Map<key, {DEBIT, CREDIT}> */
// What the function does: It reads a list of rows, 
// groups them by some value (like an account ID), and
// keeps a running total of debit and credit amounts for each group.
function toLegs<T extends Row, K>(rows: T[], key: (r: T) => K) {
  const map = new Map<K, Legs>();
  for (const r of rows) {
    const k = key(r);
    const legs = map.get(k) ?? { DEBIT: 0, CREDIT: 0 };
    legs[r.direction] += r._sum.amount ?? 0;
    map.set(k, legs);
  }
  return map;
}

export async function reconcileLedger(
  { autoFix = false, verbose = false }: ReconcileOptions = {}
): Promise<ReconciliationReport> {
  // All DB work up front, in parallel. Postgres does the summing.
  const [globalRows, txRows, walletRows, wallets] = await Promise.all([
    prisma.ledgerEntry.groupBy({ by: ["direction"], _sum: { amount: true } }),
    prisma.ledgerEntry.groupBy({
      by: ["transactionId", "direction"],
      where: { transactionId: { not: null } },
      _sum: { amount: true },
    }),
    prisma.ledgerEntry.groupBy({ by: ["walletId", "direction"], _sum: { amount: true } }),
    prisma.wallet.findMany({
      select: { id: true, userId: true, balance: true, user: { select: { name: true } } },
      orderBy: { id: "asc" },
    }),
  ]);

  // 1. Global check
  const { DEBIT: totalDebits, CREDIT: totalCredits } =
    toLegs(globalRows, () => 0).get(0) ?? { DEBIT: 0, CREDIT: 0 };
  const difference = totalDebits - totalCredits;

  // 2. Per-transaction check
  const txLegs = toLegs(txRows, (r) => r.transactionId as number);
  const txAmounts = new Map(
    (await prisma.transaction.findMany({
      where: { id: { in: [...txLegs.keys()] } },
      select: { id: true, amount: true },
    })).map((t) => [t.id, t.amount])
  );

  const unbalancedTransactions = [...txLegs]
    .map(([transactionId, l]) => ({
      transactionId,
      debits: l.DEBIT,
      credits: l.CREDIT,
      expectedAmount: txAmounts.get(transactionId) ?? 0,
    }))
    .filter((t) => t.debits !== t.credits || t.debits !== t.expectedAmount);

  // 3. Wallet check
  const walletLegs = toLegs(walletRows, (r) => r.walletId);
  const discrepancies = wallets
    .map((w) => {
      const l = walletLegs.get(w.id) ?? { DEBIT: 0, CREDIT: 0 };
      const ledgerSum = l.CREDIT - l.DEBIT;
      return {
        walletId: w.id,
        userId: w.userId,
        userName: w.user?.name ?? "Unknown",
        balance: w.balance,
        ledgerSum,
        difference: w.balance - ledgerSum,
        fixed: false,
      };
    })
    .filter((d) => d.difference !== 0);

  if (autoFix && discrepancies.length) {
    await prisma.$transaction(
      discrepancies.map((d) =>
        prisma.wallet.update({ where: { id: d.walletId }, data: { balance: d.ledgerSum } })
      )
    );
    discrepancies.forEach((d) => (d.fixed = true));
  }

  const report: ReconciliationReport = {
    timestamp: new Date().toISOString(),
    status:
      difference === 0 && !unbalancedTransactions.length && !discrepancies.length
        ? "BALANCED"
        : "DISCREPANCY_DETECTED",
    globalCheck: { totalDebits, totalCredits, difference, isBalanced: difference === 0 },
    transactionCheck: {
      totalTransactionsChecked: txLegs.size,
      unbalancedCount: unbalancedTransactions.length,
      unbalancedTransactions,
    },
    walletCheck: {
      totalWalletsChecked: wallets.length,
      matchedWalletsCount: wallets.length - discrepancies.length,
      discrepancyCount: discrepancies.length,
      discrepancies,
    },
  };

  if (verbose) printReport(report);
  return report;
}

function printReport(r: ReconciliationReport) {
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const { globalCheck: g, transactionCheck: t, walletCheck: w } = r;

  console.log(`\n📊 LEDGER RECONCILIATION (${r.timestamp})`);
  console.log(r.status === "BALANCED" ? "✅ BALANCED" : "❌ DISCREPANCY DETECTED");
  console.log(`Debits ${inr(g.totalDebits)} | Credits ${inr(g.totalCredits)} | Diff ${inr(g.difference)}`);
  console.log(`Transactions: ${t.totalTransactionsChecked} checked, ${t.unbalancedCount} unbalanced`);
  console.log(`Wallets: ${w.totalWalletsChecked} checked, ${w.matchedWalletsCount} matched, ${w.discrepancyCount} off`);

  for (const d of w.discrepancies) {
    console.log(
      ` - ${d.userName} (user ${d.userId}, wallet ${d.walletId}): balance ${inr(d.balance)} vs ledger ${inr(d.ledgerSum)} (diff ${inr(d.difference)})${d.fixed ? " [FIXED]" : ""}`
    );
  }
}

export async function backfillLedgerEntries() {
  const [wallets, txns] = await Promise.all([
    prisma.wallet.findMany({ select: { id: true, userId: true } }),
    prisma.transaction.findMany({
      where: { ledgerEntries: { none: {} } },
      orderBy: { id: "asc" },
    }),
  ]);
  const walletOf = new Map(wallets.map((w) => [w.userId, w.id]));

  const data = txns.flatMap((t) => {
    const from = walletOf.get(t.senderId);
    const to = walletOf.get(t.receiverId);
    if (!from || !to) {
      console.warn(`[Backfill] Skipping tx #${t.id}: missing wallet`);
      return [];
    }
    const base = { transactionId: t.id, amount: t.amount, createdAt: t.createdAt };
    return [
      { ...base, walletId: from, direction: "DEBIT" as const },
      { ...base, walletId: to, direction: "CREDIT" as const },
    ];
  });

  if (data.length) await prisma.ledgerEntry.createMany({ data });

  return {
    scannedTransactions: txns.length,
    backfilledTransactions: data.length / 2,
    ledgerEntriesCreated: data.length,
  };
}