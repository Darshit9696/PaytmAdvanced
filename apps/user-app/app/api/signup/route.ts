import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@repo/db/client";

export const POST = async (request: Request) => {
    try {
        const { name, email, phone, password } = await request.json();

        // 1. Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                number: phone
            }
        })
        
        if (existingUser) {
            return NextResponse.json({
                msg: "User already exists",
            }, {
                status: 400
            })
        }

        // 2. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create the user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                number: phone
            }
        })

        return NextResponse.json({
            msg: "Signed up successfully",
        }, {
            status: 201,
        })

    }
    catch (e: any) {
        console.log(e);

        return NextResponse.json({
            msg: "An error occurred while signing up",
            error: e.message
        }, { status: 500 });
    }
}