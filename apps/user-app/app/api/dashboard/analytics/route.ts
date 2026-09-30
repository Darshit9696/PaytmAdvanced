import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db/client";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const REQUIRED_CATEGORIES = ["Food", "Shopping", "Travel", "Entertainment"] as const;

export const GET = async () => {
  // 1. Session authentication
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "merchant") {
    return NextResponse.json(
      { message: "Merchant accounts cannot access personal user analytics" },
      { status: 403 }
    );
  }

  const userId = Number(session.user.id);
  if (isNaN(userId) || userId <= 0) {
    return NextResponse.json({ message: "Invalid user session" }, { status: 400 });
  }

  // 2. Fetch User & Wallet Balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      wallet: {
        select: {
          balance: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const balance = user.wallet?.balance ? Number(user.wallet.balance) : 0;

  // 3. Fetch all completed P2P transactions for this user
  const [sentTransactions, receivedTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: { senderId: userId },
      select: {
        id: true,
        amount: true,
        category: true,
        createdAt: true,
        receiverId: true,
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.transaction.findMany({
      where: { receiverId: userId },
      select: {
        id: true,
        amount: true,
        category: true,
        createdAt: true,
        senderId: true,
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // 4. Calculate Current Calendar Month Boundaries
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 1, 0, 0, 0, 0);
  const startOfMonthMs = startOfMonth.getTime();
  const endOfMonthMs = endOfMonth.getTime();

  // Monthly Spending & Income
  let monthlySpendingAmount = 0;
  let monthlySpendingCount = 0;
  for (const tx of sentTransactions) {
    const txMs = tx.createdAt.getTime();
    if (txMs >= startOfMonthMs && txMs < endOfMonthMs) {
      monthlySpendingAmount += Number(tx.amount);
      monthlySpendingCount += 1;
    }
  }

  let monthlyIncomeAmount = 0;
  let monthlyIncomeCount = 0;
  for (const tx of receivedTransactions) {
    const txMs = tx.createdAt.getTime();
    if (txMs >= startOfMonthMs && txMs < endOfMonthMs) {
      monthlyIncomeAmount += Number(tx.amount);
      monthlyIncomeCount += 1;
    }
  }

  // 5. Category-Based Spending Breakdown (Current Calendar Month Outgoings)
  const categories = REQUIRED_CATEGORIES.map((cat) => {
    let catAmount = 0;
    let catCount = 0;

    for (const tx of sentTransactions) {
      const txMs = tx.createdAt.getTime();
      if (txMs >= startOfMonthMs && txMs < endOfMonthMs) {
        if (tx.category && tx.category.toLowerCase() === cat.toLowerCase()) {
          catAmount += Number(tx.amount);
          catCount += 1;
        }
      }
    }

    return {
      category: cat,
      amount: catAmount,
      transactionCount: catCount,
    };
  });

  // 6. Daily Chart Data (Current Calendar Month, 1 to daysInMonth)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyChart = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStart = new Date(currentYear, currentMonth, d, 0, 0, 0, 0);
    const dayEnd = new Date(currentYear, currentMonth, d + 1, 0, 0, 0, 0);
    const dayStartMs = dayStart.getTime();
    const dayEndMs = dayEnd.getTime();

    const dateFormatted = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const labelFormatted = `${d} ${MONTH_NAMES[currentMonth]}`;

    let daySpending = 0;
    for (const tx of sentTransactions) {
      const txMs = tx.createdAt.getTime();
      if (txMs >= dayStartMs && txMs < dayEndMs) {
        daySpending += Number(tx.amount);
      }
    }

    let dayIncome = 0;
    for (const tx of receivedTransactions) {
      const txMs = tx.createdAt.getTime();
      if (txMs >= dayStartMs && txMs < dayEndMs) {
        dayIncome += Number(tx.amount);
      }
    }

    dailyChart.push({
      date: dateFormatted,
      label: labelFormatted,
      spending: daySpending,
      income: dayIncome,
    });
  }

  // 7. Weekly Chart Data (Last 8 Calendar Weeks, Mon->Sun)
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentWeekMonday = new Date(currentYear, currentMonth, now.getDate() + diffToMonday, 0, 0, 0, 0);

  const weeklyChart = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(
      currentWeekMonday.getFullYear(),
      currentWeekMonday.getMonth(),
      currentWeekMonday.getDate() - w * 7,
      0,
      0,
      0,
      0
    );
    const weekEnd = new Date(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      weekStart.getDate() + 7,
      0,
      0,
      0,
      0
    );

    const weekStartMs = weekStart.getTime();
    const weekEndMs = weekEnd.getTime();

    const weekStartYear = weekStart.getFullYear();
    const weekStartMonth = String(weekStart.getMonth() + 1).padStart(2, "0");
    const weekStartDay = String(weekStart.getDate()).padStart(2, "0");
    const weekStartFormatted = `${weekStartYear}-${weekStartMonth}-${weekStartDay}`;
    const weekLabelFormatted = `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()}`;

    let weekSpending = 0;
    for (const tx of sentTransactions) {
      const txMs = tx.createdAt.getTime();
      if (txMs >= weekStartMs && txMs < weekEndMs) {
        weekSpending += Number(tx.amount);
      }
    }

    let weekIncome = 0;
    for (const tx of receivedTransactions) {
      const txMs = tx.createdAt.getTime();
      if (txMs >= weekStartMs && txMs < weekEndMs) {
        weekIncome += Number(tx.amount);
      }
    }

    weeklyChart.push({
      weekStart: weekStartFormatted,
      label: weekLabelFormatted,
      spending: weekSpending,
      income: weekIncome,
    });
  }

  // 8. Calculate Top Friends
  // Most Paid User
  const sentByReceiverMap = new Map<number, { id: number; name: string; totalAmount: number; transactionCount: number }>();
  for (const tx of sentTransactions) {
    if (!tx.receiver) continue;
    const existing = sentByReceiverMap.get(tx.receiverId) || {
      id: tx.receiver.id,
      name: tx.receiver.name,
      totalAmount: 0,
      transactionCount: 0,
    };
    existing.totalAmount += Number(tx.amount);
    existing.transactionCount += 1;
    sentByReceiverMap.set(tx.receiverId, existing);
  }

  let mostPaidUser: { id: number; name: string; avatarUrl: string | null; totalAmount: number; transactionCount: number } | null = null;
  let maxSentAmount = -1;
  for (const receiver of sentByReceiverMap.values()) {
    if (receiver.totalAmount > maxSentAmount) {
      maxSentAmount = receiver.totalAmount;
      mostPaidUser = {
        id: receiver.id,
        name: receiver.name,
        avatarUrl: null,
        totalAmount: receiver.totalAmount,
        transactionCount: receiver.transactionCount,
      };
    }
  }

  // Most Received User
  const receivedBySenderMap = new Map<number, { id: number; name: string; totalAmount: number; transactionCount: number }>();
  for (const tx of receivedTransactions) {
    if (!tx.sender) continue;
    const existing = receivedBySenderMap.get(tx.senderId) || {
      id: tx.sender.id,
      name: tx.sender.name,
      totalAmount: 0,
      transactionCount: 0,
    };
    existing.totalAmount += Number(tx.amount);
    existing.transactionCount += 1;
    receivedBySenderMap.set(tx.senderId, existing);
  }

  let mostReceivedUser: { id: number; name: string; avatarUrl: string | null; totalAmount: number; transactionCount: number } | null = null;
  let maxReceivedAmount = -1;
  for (const sender of receivedBySenderMap.values()) {
    if (sender.totalAmount > maxReceivedAmount) {
      maxReceivedAmount = sender.totalAmount;
      mostReceivedUser = {
        id: sender.id,
        name: sender.name,
        avatarUrl: null,
        totalAmount: sender.totalAmount,
        transactionCount: sender.transactionCount,
      };
    }
  }

  return NextResponse.json({
    balance,
    monthly: {
      spending: {
        amount: monthlySpendingAmount,
        transactionCount: monthlySpendingCount,
      },
      income: {
        amount: monthlyIncomeAmount,
        transactionCount: monthlyIncomeCount,
      },
    },
    categories,
    charts: {
      daily: dailyChart,
      weekly: weeklyChart,
    },
    topFriends: {
      mostPaid: mostPaidUser,
      mostReceived: mostReceivedUser,
    },
  });
};
