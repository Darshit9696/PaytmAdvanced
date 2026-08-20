import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@repo/db/client";

// User initiates withdrawal (Off-Ramp)
//         │
//         ▼
// POST /api/off-ramp
//         │
//         ▼
// Authenticate user
//         │
//         ▼
// Validate amount
//         │
//         ▼
// Generate UUID token
//         │
//         ▼
// Insert Processing OffRampTransaction
//         │
//         ▼
// Return token + redirect URL (bank payout gateway)

export const POST = async (request: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id || session.user.role === "merchant") {
        return NextResponse.json({
            error: "User not authorized"
        }, { status: 401 });
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (isNaN(amount) || amount <= 0) {
        return NextResponse.json(
            { error: "Invalid amount" },
            { status: 400 }
        );
    }

    const userId = Number(session.user.id);

    // Ensure user wallet exists and has sufficient balance for prompt UX feedback
    const wallet = await prisma.wallet.findUnique({
        where: { userId }
    });

    if (!wallet || wallet.balance < amount) {
        return NextResponse.json(
            { error: "Insufficient wallet balance" },
            { status: 400 }
        );
    }

    const token = crypto.randomUUID();
    const provider = "HDFC";

    try {
        await prisma.offRampTransaction.create({
            data: {
                token,
                amount,
                provider,
                status: "Processing",
                userId,
            }
        });
    } catch (error) {
        console.error("Off-ramp creation failed:", error);
        return NextResponse.json({
            error: "Error creating transaction",
        }, { status: 500 });
    }

    return NextResponse.json({
        token,
        redirectUrl: `http://localhost:3001/payout?token=${token}`
    });
};
