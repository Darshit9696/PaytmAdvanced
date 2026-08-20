import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db/client";
import NextAuth, { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request : NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role === "merchant") return NextResponse.json({
        msg : "User not authorized"
    },{
        status : 401,
    })

    const user = session.user;
    const userId = user.id; 

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = 10;

const transactions = await prisma.transaction.findMany({
  where: {
    OR: [
      { senderId: Number(userId) },
      { receiverId: Number(userId) }
    ]
  },
  skip : (page - 1) * limit,
  take: limit,
  include: {
    sender: {
      select: {
        id: true,
        name: true,
        number: true,
      }
    },
    receiver: {
      select: {
        id: true,
        name: true,
        number: true,
      }
    }
  },
  orderBy: {
    createdAt: "desc"
  }
});

    return NextResponse.json({
        transactions
    })

}