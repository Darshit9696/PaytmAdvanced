import { prisma } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Transaction, TransactionStatus } from "@prisma/client";


    // GET /api/merchant/payments
            //   ↓
    // Get logged-in merchant
            //   ↓
    // Get merchantId
            //   ↓
    // Optional status filter
            //   ↓
    // findMany MerchantTransaction
            //   ↓
    // Return recent payments

export const GET = async (request: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    if (session.user.role && session.user.role !== "MERCHANT") {
        return NextResponse.json(
            { message: "Forbidden" },
            { status: 403 }
        );
    }

    const merchantId = Number(session.user.merchantId || session.user.id);

    if (isNaN(merchantId) || merchantId <= 0) {
        return NextResponse.json(
            { message: "Invalid merchant ID" },
            { status: 400 }
        );
    }
    
    // 4. Read optional status filter
    const statusParam = request.nextUrl.searchParams.get("status") as TransactionStatus;
    const validStatuses = ["PENDING", "SUCCESS", "FAILED"];
    
    if (
        statusParam &&
        !validStatuses.includes(statusParam)
    ) {
        return NextResponse.json(
            { message: "Invalid status" },
            { status: 400 }
        );
    }

    const payments = await prisma.merchantTransaction.findMany({
        where: {
            merchantId,
            ...(statusParam ? { status : statusParam } : {}),
        },
        select: {
            transactionId: true,
            amount: true,
            status: true,
            createdAt: true,
            customer: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    // 4. Return them
    return NextResponse.json({
        payments,
    });

} 