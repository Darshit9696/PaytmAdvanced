import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db/client";

export const GET = async (request : NextRequest) => {

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if(!token) return NextResponse.json({
        error : "Token is required"
    })

    // returning the amount and token from the onramp table and return the username ,balance and a/c number from the bank table 
    const TransactionUser = await prisma.onRampTransaction.findUnique({
        where : {
            token,
        },
        select : {
            token : true,
            amount : true,

            user : {
                select : {
                    name : true,

                    bankAccount : {
                        select : {
                            accountNumber : true,
                            balance : true,
                            bankName : true
                        },
                    },
                },
            },
        },
    });
    
    if(!TransactionUser) return NextResponse.json({
        error : "Invalid token"
    })

    return NextResponse.json({
        name: TransactionUser.user.name,
        bankAccount: TransactionUser.user.bankAccount,
        token: TransactionUser.token,
        amount: TransactionUser.amount,
    })
}