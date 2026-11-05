import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db/client";

/**
 * GET /api/ledger
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - direction: "DEBIT" | "CREDIT" | "ALL"
 * - walletId: number (optional)
 * - search: string (optional - searches user name or transaction note)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const direction = searchParams.get("direction");
    const walletIdParam = searchParams.get("walletId");
    const walletId = walletIdParam ? parseInt(walletIdParam, 10) : undefined;
    const search = searchParams.get("search")?.trim() || "";

    const where: any = {};

    if (direction === "DEBIT" || direction === "CREDIT") {
      where.direction = direction;
    }

    if (walletId && !isNaN(walletId)) {
      where.walletId = walletId;
    }

    if (search) {
      where.OR = [
        {
          wallet: {
            user: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
        {
          transaction: {
            note: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const [entries, totalCount, debitAgg, creditAgg] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          wallet: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  number: true,
                },
              },
            },
          },
          transaction: {
            select: {
              id: true,
              amount: true,
              note: true,
              category: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                  number: true,
                },
              },
              receiver: {
                select: {
                  id: true,
                  name: true,
                  number: true,
                },
              },
            },
          },
        },
      }),
      prisma.ledgerEntry.count({ where }),
      prisma.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: { direction: "DEBIT" },
      }),
      prisma.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: { direction: "CREDIT" },
      }),
    ]);

    const totalDebits = debitAgg._sum.amount || 0;
    const totalCredits = creditAgg._sum.amount || 0;

    return NextResponse.json({
      success: true,
      entries,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        totalDebits,
        totalCredits,
        netDifference: totalDebits - totalCredits,
        isBalanced: totalDebits === totalCredits,
      },
    });
  } catch (error: any) {
    console.error("[Ledger API] Error fetching ledger entries:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch ledger entries", error: error.message },
      { status: 500 }
    );
  }
}
