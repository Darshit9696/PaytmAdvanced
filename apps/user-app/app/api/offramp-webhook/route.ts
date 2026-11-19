import { prisma } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSecret } from "@/lib/webhook-auth";

export const POST = async (request: NextRequest) => {
    // 1. Authenticate webhook caller via shared secret
    const authResult = verifyWebhookSecret(request);
    if (!authResult.isValid) {
        return NextResponse.json(
            { error: authResult.error },
            { status: authResult.statusCode || 401 }
        );
    }

    const { token } = await request.json();

    if (!token || typeof token !== "string") {
        return NextResponse.json(
            { error: "Token is required" },
            { status: 400 }
        );
    }

    const transaction = await prisma.offRampTransaction.findUnique({
        where: {
            token,
        },
    });

    if (!transaction || transaction.status !== "Success") {
        return NextResponse.json(
            { error: "Payout not completed" },
            { status: 400 }
        );
    }

    return NextResponse.json({
        success: true,
        message: "Off-ramp transaction confirmed",
    });
};
