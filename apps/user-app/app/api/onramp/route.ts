import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@repo/db/client";

// User clicks Add Money
        // │
//         ▼
// POST /api/onramp
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
// Insert Processing transaction
//         │
//         ▼
// Return token + redirect URL

export const POST = async (request: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role === "merchant") return NextResponse.json({
        error: "User not authorized",
        status: 401
    })

    const { amount } = await request.json();
    if (!amount || amount <= 0) return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
    )

    const user = session.user;

    // get the user Id from the session object
    const userId = Number(user.id);

    const token = crypto.randomUUID();
    const provider = "HDFC";
    try {
        await prisma.onRampTransaction.create({
            data: {
                token,
                amount,
                provider,
                status: "Processing",
                userId,
            }
        });
    }catch(error)
    {
        return NextResponse.json({
            error : "Error creating transaction",
        })
    }

    return NextResponse.json({
        token,
        redirectUrl: `http://localhost:3001/pay?token=${token}`
    });

}