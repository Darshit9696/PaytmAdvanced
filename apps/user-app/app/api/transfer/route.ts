import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db/client";
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";


export const POST = async (request: Request) => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role === "merchant") {
        return NextResponse.json({ message: "Merchants cannot perform personal user wallet transfers" }, { status: 403 });
    }
    const senderId = session.user?.id;

    const body = await request.json();
    console.log(body);
    console.log(typeof body.amount);
    console.log(body.amount);

    const receiverId = body.receiverId;
    console.log(receiverId);

    const requiredAmount = body.amount;

    const receiverWallet = await prisma.wallet.findUnique({
        where: {
            userId: Number(receiverId)
        }
    })

    if (!receiverWallet) {
        return NextResponse.json(
            { message: "Receiver wallet not found" },
            { status: 404 }
        );
    }

    if (requiredAmount <= 0) {
        return NextResponse.json(
            { message: "Invalid amount" },
            { status: 400 }
        );
    }

    // if the sender or reciever is missing
    if (!senderId || !receiverId) {
        return new NextResponse("Missing sender or reciever", {
            status: 400,
        })
    }

    if (senderId === receiverId) {
        return NextResponse.json(
            { message: "You cannot send money to yourself" },
            { status: 400 }
        );
    }

    const senderWallet = await prisma.wallet.findUnique({
        where: {
            userId: Number(senderId),
        }
    })

    if (!senderWallet) {
        return NextResponse.json(
            { message: "Wallet not found" },
            { status: 404 }
        );
    }

    if (senderWallet.balance! < requiredAmount) {
        return NextResponse.json(
            { msg: "Insufficient Amount" },
            { status: 400 }
        )
    }

    try {
        // locking the transactions till it gets over
        const transaction = await prisma.$transaction(async (tx) => {

            // incrememnt to the receiver acc  
            await tx.wallet.update({
                where: {
                    userId: Number(receiverId)
                },

                data: {
                    balance: {
                        // increment the amount to the receiver wallet
                        increment: requiredAmount
                    }
                }
            })

            await tx.wallet.update({
                where: {
                    userId: Number(senderId)
                },

                data: {
                    balance: {
                        // decrement the amount from the sender wallet
                        decrement: requiredAmount
                    }
                }
            })

            await tx.transaction.create({
                data: {
                    senderId: Number(senderId),
                    receiverId: Number(receiverId),
                    amount: requiredAmount,
                    note: body.note || null,
                    category: body.category || null,
                }
            });

            const users = await tx.user.findMany({
                where: {
                    id: {
                        in: [
                            Number(senderId),
                            Number(receiverId)
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
            await tx.notification.createMany({
                data: [
                    {
                        userId: Number(receiverId),
                        title: "Payment Received",
                        type: "TRANSFER_RECEIVED",
                        message: `You have successfully received ₹${Number(requiredAmount).toFixed(2)} from ${sender.name}`,
                    },
                    {
                        userId: Number(senderId),
                        title: "Transfer Successful",
                        type: "TRANSFER_SENT",
                        message: `You have successfully sent ₹${Number(requiredAmount).toFixed(2)} to ${receiver.name}`,
                    }
                ]
            })

            return {
                senderId: Number(senderId),
                receiverId: Number(receiverId),
                amount: requiredAmount,
            };
        })

        return NextResponse.json({
            message: "Transfer successful",
            transaction
        });
    } catch (e) {
        console.error(e);

        return NextResponse.json(
            {
                message: "Transaction failed",
                error: e instanceof Error ? e.message : "Unknown error"
            },
            {
                // something went wrong , not the user 's fault
                status: 500
            }
        );
    }
}