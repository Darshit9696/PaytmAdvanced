import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db/client";
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";


export const POST = async (request: Request) => {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
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
        where : {
            userId : Number(receiverId)
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
            { msg: "Insufficinent Amount" },
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
                        decrement: requiredAmount
                    }
                }
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
                error : e instanceof Error ? e.message : "Unknown error"
            },
            {
                // something went wrong , not the user 's fault
                status: 500
            }
        );
    }
}