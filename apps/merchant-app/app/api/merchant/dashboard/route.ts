import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db/client";
import { TransactionStatus } from "@prisma/client";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const GET = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role && session.user.role !== "MERCHANT") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const merchantId = Number(session.user.merchantId || session.user.id);

  if (isNaN(merchantId) || merchantId <= 0) {
    return NextResponse.json(
      { message: "Invalid merchant ID" },
      { status: 400 }
    );
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: { id: true },
  });

  if (!merchant) {
    return NextResponse.json(
      { message: "Merchant not found" },
      { status: 404 }
    );
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  // Date boundaries for Today & Yesterday
  const startOfToday = new Date(currentYear, currentMonth, currentDate, 0, 0, 0, 0);
  const endOfToday = new Date(currentYear, currentMonth, currentDate + 1, 0, 0, 0, 0);
  const startOfYesterday = new Date(currentYear, currentMonth, currentDate - 1, 0, 0, 0, 0);

  // Date boundaries for This Month & Last Month
  const startOfThisMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
  const endOfThisMonth = new Date(currentYear, currentMonth + 1, 1, 0, 0, 0, 0);
  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);

  // Calendar week calculations: Monday through Sunday
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(currentYear, currentMonth, currentDate + diffToMonday, 0, 0, 0, 0);
  const nextMonday = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + 7, 0, 0, 0, 0);
  const prevMonday = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() - 7, 0, 0, 0, 0);

  // Fetch all transactions and status counts in parallel
  const [successTransactions, pendingCount, totalCount] = await Promise.all([
    prisma.merchantTransaction.findMany({
      where: {
        merchantId: merchant.id,
        status: TransactionStatus.SUCCESS,
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.merchantTransaction.count({
      where: {
        merchantId: merchant.id,
        status: TransactionStatus.PENDING,
      },
    }),
    prisma.merchantTransaction.count({
      where: {
        merchantId: merchant.id,
      },
    }),
  ]);

  // 1. Calculate Today & Yesterday Revenue
  const todayMs = startOfToday.getTime();
  const endTodayMs = endOfToday.getTime();
  const yesterdayMs = startOfYesterday.getTime();

  let todayRevenue = 0;
  let yesterdayRevenue = 0;

  // 2. Calculate This Month & Last Month Revenue
  const thisMonthMs = startOfThisMonth.getTime();
  const endThisMonthMs = endOfThisMonth.getTime();
  const lastMonthMs = startOfLastMonth.getTime();

  let thisMonthRevenue = 0;
  let lastMonthRevenue = 0;

  // 3. Calculate 7-Day Velocity Data & Preceding Week Revenue
  const prevMondayMs = prevMonday.getTime();
  const currentMondayMs = currentMonday.getTime();
  const nextMondayMs = nextMonday.getTime();

  let prevWeekRevenue = 0;

  for (const tx of successTransactions) {
    const txMs = tx.createdAt.getTime();
    const amount = Number(tx.amount);

    // Today / Yesterday
    if (txMs >= todayMs && txMs < endTodayMs) {
      todayRevenue += amount;
    } else if (txMs >= yesterdayMs && txMs < todayMs) {
      yesterdayRevenue += amount;
    }

    // Month
    if (txMs >= thisMonthMs && txMs < endThisMonthMs) {
      thisMonthRevenue += amount;
    } else if (txMs >= lastMonthMs && txMs < thisMonthMs) {
      lastMonthRevenue += amount;
    }

    // Weekly
    if (txMs >= prevMondayMs && txMs < currentMondayMs) {
      prevWeekRevenue += amount;
    }
  }

  // 7 day objects for the current week
  const data = DAY_LABELS.map((dayLabel, index) => {
    const dayStart = new Date(
      currentMonday.getFullYear(),
      currentMonday.getMonth(),
      currentMonday.getDate() + index,
      0,
      0,
      0,
      0
    );
    const dayEnd = new Date(
      dayStart.getFullYear(),
      dayStart.getMonth(),
      dayStart.getDate() + 1,
      0,
      0,
      0,
      0
    );

    const startMs = dayStart.getTime();
    const endMs = dayEnd.getTime();

    let dayAmount = 0;
    let dayTxCount = 0;

    for (const tx of successTransactions) {
      const txMs = tx.createdAt.getTime();
      if (txMs >= startMs && txMs < endMs) {
        dayAmount += Number(tx.amount);
        dayTxCount += 1;
      }
    }

    return {
      day: dayLabel,
      amount: dayAmount,
      transactions: dayTxCount,
    };
  });

  const totalWeekly = data.reduce((sum, d) => sum + d.amount, 0);

  // Velocity percentage changes
  let changePercentage: number | null = null;
  if (prevWeekRevenue > 0) {
    const change = ((totalWeekly - prevWeekRevenue) / prevWeekRevenue) * 100;
    changePercentage = Number(change.toFixed(1));
  }

  let todayChangePercentage: number | null = null;
  if (yesterdayRevenue > 0) {
    const diff = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    todayChangePercentage = Number(diff.toFixed(1));
  }

  let monthChangePercentage: number | null = null;
  if (lastMonthRevenue > 0) {
    const diff = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    monthChangePercentage = Number(diff.toFixed(1));
  }

  const successRate = totalCount > 0 ? Math.round((successTransactions.length / totalCount) * 100) : 100;

  return NextResponse.json({
    data,
    totalWeekly,
    changePercentage,
    stats: {
      todayRevenue: {
        amount: todayRevenue,
        changePercentage: todayChangePercentage,
      },
      thisMonth: {
        amount: thisMonthRevenue,
        changePercentage: monthChangePercentage,
      },
      successfulPayments: {
        count: successTransactions.length,
        successRate,
      },
      pendingPayments: {
        count: pendingCount,
      },
    },
  });
};
