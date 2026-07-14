import { NextResponse } from "next/server";
// We import the global prisma instance we created in packages/db/src/index.ts
import { prisma } from "@repo/db/client";

export const GET = async () => {
    try {
        // Spawns a user with a unique email using Math.random() so you can refresh without errors
        await prisma.user.create({
            data: {
                email: `test-${Math.floor(Math.random() * 10000)}@example.com`,
                name: "Darshit"
            }
        });
        
        return NextResponse.json({
            message: "Hi there! User successfully created in your Neon Database."
        });
    } catch (error: any) {
        return NextResponse.json({
            error: "Something went wrong",
            details: error.message
        }, { status: 500 });
    }
};