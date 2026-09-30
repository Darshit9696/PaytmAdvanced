import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
export const GET = async (request: NextRequest) => {
    const session = await getServerSession(authOptions);
    
    if(!session || !session.user || session.user.role === "merchant")
    {
        return NextResponse.json({
            msg : "Merchants cannot access personal user notifications"
        }, {status : 403})
    }       

    const notification = await prisma.notification.findMany({
            where : {
                userId : Number(session.user.id)
            },
            select :{
                    id: true,
                    type: true,
                    title: true,
                    message: true,
                    isRead: true,
                    createdAt: true
            },
            orderBy : {
                createdAt : "desc"
            }
    })
    
    return NextResponse.json({
        notifications: notification,
        notification
    });
}