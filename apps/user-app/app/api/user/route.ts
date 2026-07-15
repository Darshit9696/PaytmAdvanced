import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export const GET = async () => {
    try {
        // "Hey NextAuth, does this incoming request belong to a logged-in user?
         const session = await getServerSession(authOptions);

         if(session?.user)
         {
            return NextResponse.json({
                user: session.user, 
                msg : "You are logged in "
            })
         }
         else{
            return NextResponse.json({
                msg : "session might be null"
            })
         }
    } catch (error: any) {
        return NextResponse.json({
            error: "Something went wrong",
            details: error.message
        }, { status: 500 });
    }
};