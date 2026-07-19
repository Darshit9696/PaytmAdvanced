import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@repo/db/client";

export const GET = async (request: Request) => {

    console.log(request.url);
    const { searchParams } = new URL(request.url);
    console.log(searchParams);

    const id = searchParams.get("id");

    const user = await prisma.user.findUnique({
        where: {
            id : Number(id)
        },
        select: {
            id:true,
            name: true,
            number: true,
        },
    })

    return new Response(JSON.stringify(user), {
        status : 200,
    })
}