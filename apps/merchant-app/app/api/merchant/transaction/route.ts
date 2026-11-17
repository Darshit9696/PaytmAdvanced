import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit";

export const POST = async (request: NextRequest) => {
    // 0. Rate limiting check (max 30 dynamic QR payment requests/min)
    const rateLimitCheck = checkRateLimit(request, rateLimitPresets.paymentRequest);
    if (!rateLimitCheck.success && rateLimitCheck.response) {
        return rateLimitCheck.response;
    }

    const { amount, description } = await request.json();
    
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