import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@repo/db/client";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit";

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
    const rateLimitCheck = checkRateLimit(request, rateLimitPresets.financial);
    if (!rateLimitCheck.success && rateLimitCheck.response) {
        return rateLimitCheck.response;
    }

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

    const bankAppUrl = process.env.BANK_APP_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : "");
    if (!bankAppUrl) {
        console.error("BANK_APP_URL is not configured");
        return NextResponse.json(
            { error: "Payment gateway URL configuration missing" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        token,
        redirectUrl: `${bankAppUrl.replace(/\/+$/, "")}/pay?token=${token}`
    });

}