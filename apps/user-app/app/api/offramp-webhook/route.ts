import { prisma } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    const { token } = await request.json();

    if (!token) {
        return NextResponse.json(
            { error: "Token is required" },
            { status: 400 }
        );
    }

    const transaction = await prisma.offRampTransaction.findUnique({
        where: {
            token,
        }
    });

    if (!transaction || transaction.status !== "Success") {
        return NextResponse.json(
            { error: "Payout not completed" },
            { status: 400 }
        );
    }

    return NextResponse.json({
        success: true,
        message: "Off-ramp transaction confirmed"
    });
};
