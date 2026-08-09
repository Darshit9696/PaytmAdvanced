import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db/client";

export const GET = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) return NextResponse.json({
        error: "Token is required"
    }, { status: 400 });

    const transactionUser = await prisma.offRampTransaction.findUnique({
        where: {
            token,
        },
        select: {
            token: true,
            amount: true,
            status: true,
            user: {
                select: {
                    name: true,
                    wallet: {
                        select: {
                            balance: true,
                        }
                    },
                    bankAccount: {
                        select: {
                            accountNumber: true,
                            balance: true,
                            bankName: true,
                        },
                    },
                },
            },
        },
    });

    if (!transactionUser) return NextResponse.json({
        error: "Invalid token"
    }, { status: 404 });

    return NextResponse.json({
        name: transactionUser.user.name,
        walletBalance: transactionUser.user.wallet?.balance ?? 0,
        bankAccount: transactionUser.user.bankAccount,
        token: transactionUser.token,
        amount: transactionUser.amount,
        status: transactionUser.status,
    });
};
