import { prisma } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

// Process payout: Deduct wallet balance, credit bank account balance, and set OffRampTransaction status to Success
export const POST = async (request: NextRequest) => {
    const { token } = await request.json();

    if (!token) {
        return new Response("Token is required", { status: 400 });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Verify transaction exists and is Processing
            const transaction = await tx.offRampTransaction.findUnique({
                where: { token },
                select: {
                    amount: true,
                    userId: true,
                    status: true,
                    user: {
                        select: {
                            name: true,
                            wallet: true,
                            bankAccount: true,
                        }
                    }
                }
            });

            if (!transaction || !transaction.user) {
                throw new Error("TRANSACTION_NOT_FOUND");
            }

            // Idempotency check: if transaction is already Success, skip financial operations
            if (transaction.status === "Success") {
                return { alreadyProcessed: true };
            }

            if (transaction.status !== "Processing") {
                throw new Error("INVALID_TRANSACTION_STATUS");
            }

            const amount = transaction.amount;
            const userId = transaction.userId;

            if (!transaction.user.wallet) {
                throw new Error("WALLET_NOT_FOUND");
            }

            if (!transaction.user.bankAccount) {
                throw new Error("BANK_ACCOUNT_NOT_FOUND");
            }

            // 2. Atomically decrement Wallet only if balance >= amount
            const walletUpdate = await tx.wallet.updateMany({
                where: {
                    userId,
                    balance: {
                        gte: amount
                    }
                },
                data: {
                    balance: {
                        decrement: amount
                    }
                }
            });

            if (walletUpdate.count === 0) {
                throw new Error("INSUFFICIENT_WALLET_BALANCE");
            }

            // 3. Atomically increment BankAccount
            await tx.bankAccount.update({
                where: { userId },
                data: {
                    balance: {
                        increment: amount
                    }
                }
            });

            // 4. Conditionally update OffRampTransaction from Processing -> Success
            const statusUpdate = await tx.offRampTransaction.updateMany({
                where: {
                    token,
                    status: "Processing"
                },
                data: {
                    status: "Success"
                }
            });

            if (statusUpdate.count === 0) {
                throw new Error("TRANSACTION_ALREADY_PROCESSED");
            }

            return { success: true };
        });

        if (result.alreadyProcessed) {
            return NextResponse.json({
                success: true,
                message: "Payout already processed"
            });
        }
    } catch (error: any) {
        console.error("Payout execution error:", error.message || error);
        if (error.message === "INSUFFICIENT_WALLET_BALANCE") {
            return new Response("Insufficient wallet balance", { status: 400 });
        }
        if (error.message === "TRANSACTION_NOT_FOUND") {
            return new Response("Transaction not found", { status: 404 });
        }
        if (error.message === "INVALID_TRANSACTION_STATUS" || error.message === "TRANSACTION_ALREADY_PROCESSED") {
            return new Response("Transaction is no longer processing", { status: 400 });
        }
        return new Response("Payout execution failed", { status: 500 });
    }

    // Call User App Off-Ramp Webhook
    const webhookUrl = process.env.USER_APP_OFFRAMP_WEBHOOK_URL ?? "http://localhost:3000/api/offramp-webhook";
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
        console.error("Off-ramp webhook request failed", error);
        return new Response("Webhook request failed", { status: 502 });
    }

    if (!webhookResponse.ok) {
        const responseBody = await webhookResponse.text().catch(() => "");
        console.error("Off-ramp webhook returned non-OK status", webhookResponse.status, responseBody);
        return new Response(`Webhook failed: ${webhookResponse.status}`, { status: 502 });
    }

    return NextResponse.json({
        success: true,
        message: "Payout successful"
    });
};
