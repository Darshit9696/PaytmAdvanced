import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit";


class TransferError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

export const POST = async (request: Request) => {
    // 0. Rate limiting check (max 15 transfers/min per IP/user)
    const rateLimitCheck = checkRateLimit(request, rateLimitPresets.financial);
    if (!rateLimitCheck.success && rateLimitCheck.response) {
        return rateLimitCheck.response;
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role === "merchant") {
        return NextResponse.json({ message: "Merchants cannot perform personal user wallet transfers" }, { status: 403 });
    }
    const senderId = session.user?.id;
    const body = await request.json();
    const receiverId = body.receiverId;

    if (!senderId || !receiverId) {
        return NextResponse.json(
            { message: "Missing sender or receiver" },
            { status: 400 }
        );
    }

    const sId = Number(senderId);
    const rId = Number(receiverId);

    if (!Number.isFinite(sId) || !Number.isFinite(rId)) {
        return NextResponse.json(
            { message: "Invalid sender or receiver ID" },
            { status: 400 }
        );
    }

    if (sId === rId) {
        return NextResponse.json(
            { message: "Sender and receiver cannot be the same user" },
            { status: 400 }
        );
    }

    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
            { message: "Invalid amount" },
            { status: 400 }
        );
    }

    const key = request.headers.get("Idempotency-Key");

    if (!key) {
        return NextResponse.json({ message: "Idempotency-Key required" }, { status: 400 });
    }

    // Fast-path: Check if this idempotency key was already completed
    const existingTransaction = await prisma.transaction.findUnique({
        where: {
            senderId_idempotencyKey: {
                senderId: sId,
                idempotencyKey: key,
            }
        }
    });

    if (existingTransaction) {
        if (existingTransaction.receiverId !== rId || Number(existingTransaction.amount) !== amount) {
            return NextResponse.json(
                { message: "Duplicate transfer detected, but with different details" },
                { status: 422 }
            );
        }
        return NextResponse.json({
            message: "Transfer successful",
            transaction: existingTransaction,
        });
    }

    const receiverWallet = await prisma.wallet.findUnique({
        where: {
            userId: rId,
        }
    });

    if (!receiverWallet) {
        return NextResponse.json(
            { message: "Receiver wallet not found" },
            { status: 404 }
        );
    }

    const senderWallet = await prisma.wallet.findUnique({
        where: {
            userId: sId,
        }
    });

    if (!senderWallet) {
        return NextResponse.json(
            { message: "Wallet not found" },
            { status: 404 }
        );
    }

    try {
        // locking the transactions till it gets over
        const transaction = await prisma.$transaction(async (tx) => {


            // create the transaction record in the database
            const txn = await tx.transaction.create({
                data: {
                    senderId: sId,
                    receiverId: rId,
                    amount: amount,
                    note: body.note || null,
                    category: body.category || null,
                    idempotencyKey: key
                }
            });

            // decrement to the sender's account
            const debit = () =>
                tx.wallet.updateMany({
                    where: { userId: sId, balance: { gte: amount } },
                    data: { balance: { decrement: amount } },
                });

            const credit = () =>
                tx.wallet.updateMany({
                    where: { userId: rId },
                    data: { balance: { increment: amount } },
                });

            let debitRes, creditRes;

            if (sId < rId) {
                // sender has the lower ID, so lock sender first
                debitRes = await debit();
                creditRes = await credit();
            }
            else {
                // receiver has the lower ID, so lock receiver first
                creditRes = await credit();
                debitRes = await debit();
            }

            if (debitRes.count === 0) {
                throw new TransferError("Insufficient balance for the sender", 400);
            }

            if (creditRes.count === 0) {
                throw new TransferError("Receiver wallet not found or could not be credited", 400);
            }

            // Append-only double-entry ledger: record 1 DEBIT and 1 CREDIT per transfer
            await tx.ledgerEntry.createMany({
                data: [
                    {
                        transactionId: txn.id,
                        walletId: senderWallet.id,
                        direction: "DEBIT",
                        amount: amount,
                    },
                    {
                        transactionId: txn.id,
                        walletId: receiverWallet.id,
                        direction: "CREDIT",
                        amount: amount,
                    },
                ],
            });


            // fetches both users in one database query by matching their IDs against the in list.
            const users = await tx.user.findMany({
                where: {
                    id: {
                        in: [
                            sId,
                            rId
                        ]
                    }
                },
                select: {
                    id: true,
                    name: true
                }
            });


            const sender = users.find(
                user => user.id === Number(senderId)
            );

            const receiver = users.find(
                user => user.id === Number(receiverId)
            );

            if (!sender || !receiver) {
                throw new Error("Sender or receiver not found");
            }

            // create the record for the receiver
            // await tx.notification.createMany({
            //     data: [
            //         {
            //             userId: Number(receiverId),
            //             title: "Payment Received",
            //             type: "TRANSFER_RECEIVED",
            //             message: `You have successfully received ₹${amount.toFixed(2)} from ${sender.name}`,
            //         },
            //         {
            //             userId: Number(senderId),
            //             title: "Transfer Successful",
            //             type: "TRANSFER_SENT",
            //             message: `You have successfully sent ₹${amount.toFixed(2)} to ${receiver.name}`,
            //         }
            //     ]
            // });
            
            await tx.outBox.create({
                data : {
                    type : "TRANSFER_COMPLETED",
                    payLoad : JSON.stringify({
                        transactionId : txn.id,
                        senderId : sId,
                        receiverId: rId,
                        amount,
                    })
                }
            })

            return txn;
        }, {
            maxWait: 10000,
            timeout: 20000,
        });

        return NextResponse.json({
            message: "Transfer successful",
            transaction
        });
    } catch (e: any) {
        console.error(e);

        // Check if transaction was already completed (P2002 duplicate key, concurrent commit during lock wait, etc.)
        const originalTransaction = await prisma.transaction.findUnique({
            where: {
                senderId_idempotencyKey: {
                    senderId: sId,
                    idempotencyKey: key,
                }
            },
        });

        if (originalTransaction) {
            if (originalTransaction.receiverId !== rId || Number(originalTransaction.amount) !== amount) {
                return NextResponse.json(
                    { message: "Duplicate transfer detected, but with different details" },
                    { status: 422 }
                );
            }

            // Matching retry: return the saved transaction without transferring again.
            return NextResponse.json({
                message: "Transfer successful",
                transaction: originalTransaction,
            });
        }

        if (e instanceof TransferError) {
            return NextResponse.json(
                { message: e.message },
                { status: e.status }
            );
        }

        return NextResponse.json(
            {
                message: "Transaction failed"
            },
            {
                // something went wrong , not the user 's fault
                status: 500
            }
        );
    }
}