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
            { error: "Valid token is required" },
            { status: 400 }
        );
    }

    // 2. Fetch the on-ramp transaction
    const transaction = await prisma.onRampTransaction.findUnique({
        where: { token },
    });

    if (!transaction || transaction.status !== "Success") {
        return NextResponse.json(
            { error: "Payment not completed" },
            { status: 400 }
        );
    }

    // 3. Check idempotency: Ensure the wallet is only credited once per token
    const eventId = `onramp_${token}`;
    const existingNotification = await prisma.notification.findUnique({
        where: {
            eventId_userId: {
                eventId,
                userId: transaction.userId,
            },
        },
    });

    if (existingNotification) {
        return NextResponse.json({
            success: true,
            message: "Deposit already processed",
        });
    }

    // 4. Atomically credit the wallet and record completion event
    try {
        await prisma.$transaction(async (tx) => {
            // Guard with unique eventId on Notification table to guarantee idempotency
            await tx.notification.create({
                data: {
                    userId: transaction.userId,
                    eventId,
                    type: "TRANSFER_RECEIVED",
                    title: "Deposit Successful",
                    message: `Deposit of ₹${(transaction.amount / 100).toFixed(2)} completed via ${transaction.provider}.`,
                },
            });

            await tx.wallet.update({
                where: {
                    userId: transaction.userId,
                },
                data: {
                    balance: {
                        increment: transaction.amount,
                    },
                },
            });
        });
    } catch (err: any) {
        // If another concurrent request already created the event, return success idempotently
        if (err.code === "P2002") {
            return NextResponse.json({
                success: true,
                message: "Deposit already processed",
            });
        }
        console.error("Wallet deposit credit failed:", err);
        return NextResponse.json(
            { error: "Failed to credit wallet" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        message: "Wallet credited successfully",
    });
};

