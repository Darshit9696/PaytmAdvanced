import { prisma } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const GET = async (request: NextRequest) => {
    const transactionId = request.nextUrl.searchParams.get("transactionId");

    if (!transactionId) {
        return NextResponse.json({
            msg: "Not a valid transaction"
        }, {
            status: 400
        });
    }

    const paymentRequest = await prisma.merchantTransaction.findUnique({
        where: {
            transactionId,
        },
        select: {
            transactionId: true,
            amount: true,
            note: true,
            status: true,
            merchant: {
                select: {
                    businessName: true
                }
            }
        }
    });

    if (!paymentRequest) {
        return NextResponse.json({
            msg: "Transaction not found"
        }, {
            status: 404
        });
    }

    return NextResponse.json(paymentRequest);
};

export const POST = async (request: NextRequest) => {
    // 1. Authenticate user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            { message: "Unauthorized. Please sign in to authorize this payment." },
            { status: 401 }
        );
    }

    if (session.user.role === "merchant") {
        return NextResponse.json(
            { message: "Merchant accounts cannot make personal checkout payments." },
            { status: 403 }
        );
    }

    const userId = Number(session.user.id);
    if (isNaN(userId) || userId <= 0) {
        return NextResponse.json(
            { message: "Invalid user session" },
            { status: 400 }
        );
    }

    // 2. Parse request body (expects ONLY transactionId)
    const body = await request.json().catch(() => ({}));
    const { transactionId } = body;

    if (!transactionId || typeof transactionId !== "string" || transactionId.trim().length === 0) {
        return NextResponse.json(
            { message: "Invalid or missing transaction ID" },
            { status: 400 }
        );
    }

    // 3. Find and validate MerchantTransaction
    const merchantTx = await prisma.merchantTransaction.findUnique({
        where: {
            transactionId: transactionId.trim(),
        },
        include: {
            merchant: {
                select: {
                    id: true,
                    businessName: true,
                    phone: true,
                    email: true,
                    password: true,
                }
            }
        }
    });

    if (!merchantTx) {
        return NextResponse.json(
            { message: "Payment request not found or does not exist." },
            { status: 404 }
        );
    }

    // 4. Verify transaction status is PENDING (prevent double payment)
    if (merchantTx.status !== "PENDING") {
        if (merchantTx.status === "SUCCESS") {
            return NextResponse.json(
                { message: "This payment request has already been completed." },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: `Payment request cannot be processed because its status is ${merchantTx.status}.` },
            { status: 400 }
        );
    }

    // 5. Check user's wallet
    const userWallet = await prisma.wallet.findUnique({
        where: {
            userId,
        }
    });

    if (!userWallet) {
        return NextResponse.json(
            { message: "User wallet not found." },
            { status: 404 }
        );
    }

    if (userWallet.balance < merchantTx.amount) {
        return NextResponse.json(
            { message: `Insufficient wallet balance. You have ₹${Number(userWallet.balance).toFixed(2)}, but ₹${Number(merchantTx.amount).toFixed(2)} is required.` },
            { status: 400 }
        );
    }

    // 6. Atomic database execution
    try {
        const completedTransaction = await prisma.$transaction(async (tx) => {
            // Re-verify inside atomic transaction to eliminate race conditions
            const currentTx = await tx.merchantTransaction.findUnique({
                where: { transactionId: transactionId.trim() },
                include: {
                    merchant: true,
                }
            });

            if (!currentTx || currentTx.status !== "PENDING") {
                throw new Error("Payment request is no longer pending or was already processed.");
            }

            // A. Deduct from paying user's wallet
            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: {
                    balance: {
                        decrement: currentTx.amount,
                    }
                }
            });

            if (updatedWallet.balance < 0) {
                throw new Error("Insufficient wallet balance.");
            }

            // B. Credit to merchant's balance
            await tx.merchant.update({
                where: { id: currentTx.merchantId },
                data: {
                    balance: {
                        increment: currentTx.amount,
                    }
                }
            });

            // C. Update MerchantTransaction to SUCCESS and record customerId
            const finalizedTx = await tx.merchantTransaction.update({
                where: { transactionId: transactionId.trim() },
                data: {
                    status: "SUCCESS",
                    customerId: userId,
                },
                select: {
                    transactionId: true,
                    amount: true,
                    note: true,
                    status: true,
                    createdAt: true,
                    merchant: {
                        select: {
                            businessName: true,
                        }
                    }
                }
            });

            // D. Identify or create corresponding User record representing the merchant
            let merchantUser = await tx.user.findFirst({
                where: {
                    OR: [
                        { number: currentTx.merchant.phone },
                        ...(currentTx.merchant.email ? [{ email: currentTx.merchant.email }] : []),
                    ]
                }
            });

            if (!merchantUser) {
                merchantUser = await tx.user.create({
                    data: {
                        name: currentTx.merchant.businessName,
                        number: currentTx.merchant.phone,
                        email: currentTx.merchant.email || null,
                        password: currentTx.merchant.password,
                    }
                });
            }

            // E. Create corresponding Transaction record for the paying user's transaction history
            await tx.transaction.create({
                data: {
                    senderId: userId,
                    receiverId: merchantUser.id,
                    amount: currentTx.amount,
                    note: currentTx.note || `Payment to ${currentTx.merchant.businessName}`,
                }
            });

            return finalizedTx;
        });

        return NextResponse.json({
            message: "Payment completed successfully",
            transaction: completedTransaction,
        });
    } catch (err: any) {
        console.error("Payment execution error:", err);
        return NextResponse.json(
            { message: err?.message || "Payment execution failed. Please try again." },
            { status: 500 }
        );
    }
};