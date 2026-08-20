import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const  POST = async (request : NextRequest) => {

    const {amount , description} = await request.json();
    
    const session =  await getServerSession(authOptions);
    const merchantId = Number(session?.user?.merchantId);

    const transactionId  = crypto.randomUUID();
    const transaction = await prisma.merchantTransaction.create({
        data : {
            transactionId,
            amount,
            note : description,
            merchantId,
        }
    });

    if(!transaction)
    {
        return NextResponse.json(
            {
                msg : "SOMETHING WENT WRONG"
            }
        )
    }

    return NextResponse.json({
        transactionId,
    })
}