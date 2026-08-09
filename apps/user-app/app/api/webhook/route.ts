import { prisma } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request:NextRequest) => {
    
    const { token } = await request.json();    

    
    const transaction = await prisma.onRampTransaction.findUnique({
    where : {
        token,
    }
    })

    if (!transaction || transaction.status !== "Success") {
        return NextResponse.json(
            { error: "Payment not completed" },
            { status: 400 }
        );
    }

    const userId =  transaction.userId
    await prisma.wallet.update({
        where : {
            userId : transaction.userId
        },
        data : {
            balance : {
                increment: transaction.amount
            }
        }
    })

    return NextResponse.json({
        success: true,
    });
}

