// transaction : 
import { prisma } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

// deduct the amt from the bank acc and add to the wallet acc
export const POST = async (request: NextRequest) => {

    // get the token
    const { token }= await request.json();
    console.log(token);
    
    if (!token) {
        return new Response("Token is required", { status: 400 });
    }

    const transaction = await prisma.onRampTransaction.findUnique({
        where: {
            token,
        },

        select: {
            amount: true,
            userId: true,
            user: {
                select: {
                    name: true,
                    bankAccount: true
                }
            }
        }
    })

    if (!transaction || !transaction.user || !transaction.user.bankAccount) {
        return new Response("Transaction not found", { status: 404 });
    }

    if (transaction.user.bankAccount.balance < transaction.amount) {
        return new Response("Insufficient balance");
    }

    // deduct the amt from the bank acc
    const userId = transaction.userId;
    const deductAmount = transaction.amount;

    // update the bank account balance : 
    await prisma.$transaction(async (tx) => {
        await tx.bankAccount.update({
            where: {
                userId,
            },
            data: {
                balance: {
                    decrement: deductAmount,
                },
            }
        })

        await tx.onRampTransaction.update({
            where : {
                token,
            },
            data : {
                status : "Success",
            }
        })
    })

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
}
