// transaction : 
import { prisma } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit";

// deduct the amt from the bank acc and add to the wallet acc
export const POST = async (request: NextRequest) => {
    // 0. Rate limiting check (max 20 settlements/min)
    const rateLimitCheck = checkRateLimit(request, rateLimitPresets.settlement);
    if (!rateLimitCheck.success && rateLimitCheck.response) {
        return rateLimitCheck.response;
    }

    // get the token
    const { token } = await request.json();
    
    if (!token) {
        return new Response("Token is required", { status: 400 });
    }

    // fetch the transaction details from the database
    const transaction = await prisma.onRampTransaction.findUnique({
        where: {
            token,
        },
        select: {
            amount: true,
            userId: true,
            status: true,
            user: {
                select: {
                    name: true,
                    bankAccount: true
                }
            }
        }
    });

    if (!transaction || !transaction.user || !transaction.user.bankAccount) {
        return new Response("Transaction not found", { status: 404 });
    }

    // Idempotency check: if already Success, skip financial deduction
    if (transaction.status === "Success") {
        return NextResponse.json({
            success: true,
            message: "Payment already processed"
        });
    }

    if (transaction.status !== "Processing") {
        return new Response("Transaction is no longer processing", { status: 400 });
    }

    const userId = transaction.userId;
    const deductAmount = transaction.amount;

    // Atomically claim the transaction and deduct bank balance
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Atomically claim status from Processing -> Success
            const claim = await tx.onRampTransaction.updateMany({
                where: {
                    token,
                    status: "Processing",
                },
                data: {
                    status: "Success",
                },
            });

            if (claim.count !== 1) {
                throw new Error("TRANSACTION_ALREADY_PROCESSED");
            }

            // 2. Atomically check balance and deduct
            const bankUpdate = await tx.bankAccount.updateMany({
                where: {
                    userId,
                    balance: {
                        gte: deductAmount,
                    },
                },
                data: {
                    balance: {
                        decrement: deductAmount,
                    },
                },
            });

            if (bankUpdate.count !== 1) {
                throw new Error("INSUFFICIENT_BALANCE");
            }
        });
    } catch (error: any) {
        if (error.message === "TRANSACTION_ALREADY_PROCESSED") {
            return new Response("Transaction has already been processed", { status: 409 });
        }
        if (error.message === "INSUFFICIENT_BALANCE") {
            return new Response("Insufficient balance", { status: 400 });
        }
        console.error("Payment transaction error:", error);
        return new Response("Payment processing failed", { status: 500 });
    }
    
    const webhookUrl = process.env.USER_APP_WEBHOOK_URL ?? "http://localhost:3000/api/webhook";
    let webhookResponse;

    try {
        webhookResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });
    } catch (error) {
        console.error("Webhook request failed", error);
        return new Response("Webhook request failed", { status: 502 });
    }

    if (!webhookResponse.ok) {
        const responseBody = await webhookResponse.text().catch(() => "");
        console.error("Webhook returned non-OK status", webhookResponse.status, responseBody);
        return new Response(`Webhook failed: ${webhookResponse.status}`, { status: 502 });
    }

    return NextResponse.json({
        success: true,
        message: "Payment successful"
    });    
};
