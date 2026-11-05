import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "@repo/db/client";
import { seedUserData } from "@/lib/seed-user";

export const POST = async (request: Request) => {
  try {
    // 1. Safely parse JSON body
    const body: unknown = await request.json().catch(() => null);

    if (
      typeof body !== "object" ||
      body === null ||
      !("name" in body) ||
      !("email" in body) ||
      !("phone" in body) ||
      !("password" in body)
    ) {
      return NextResponse.json(
        { message: "Invalid request body", msg: "Invalid request body" },
        { status: 400 },
      );
    }

    const { name, email, phone, password } = body as {
      name: unknown;
      email: unknown;
      phone: unknown;
      password: unknown;
    };

    // 2. Validate types and required presence
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { message: "All fields must be strings", msg: "All fields must be strings" },
        { status: 400 },
      );
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (!trimmedName || !normalizedEmail || !normalizedPhone || !password) {
      return NextResponse.json(
        { message: "All fields are required", msg: "All fields are required" },
        { status: 400 },
      );
    }

    // 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { message: "Invalid email format", msg: "Invalid email format" },
        { status: 400 },
      );
    }

    // 4. Validate phone format (10-digit number)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(normalizedPhone)) {
      return NextResponse.json(
        {
          message: "Phone number must be a valid 10-digit number",
          msg: "Phone number must be a valid 10-digit number",
        },
        { status: 400 },
      );
    }

    // 5. Validate password length (min 6 characters to match frontend signup form)
    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must be at least 6 characters long",
          msg: "Password must be at least 6 characters long",
        },
        { status: 400 },
      );
    }

    // 6. Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { number: normalizedPhone },
          { email: normalizedEmail },
        ],
      },
      select: { id: true, number: true, email: true },
    });

    if (existingUser) {
      const field = existingUser.number === normalizedPhone ? "phone number" : "email";
      return NextResponse.json(
        {
          message: `A user with that ${field} already exists`,
          msg: `A user with that ${field} already exists`,
        },
        { status: 409 },
      );
    }

    // 7. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. Generate 12-digit account number (100000000000 - 999999999999)
    const accountNumber = Math.floor(
      100000000000 + Math.random() * 900000000000,
    ).toString();

    // 9. Atomic creation of user, bank account, and wallet
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: trimmedName,
          email: normalizedEmail,
          password: hashedPassword,
          number: normalizedPhone,
          bankAccount: {
            create: {
              accountNumber,
              bankName: "HDFC",
              balance: 50_000,
            },
          },
        },
        select: { id: true },
      });

      const wallet = await tx.wallet.create({
            data: {
              userId: createdUser.id,
              balance: 10_000,
            },
            select: { id: true },
          });

          // 2. Credit the 10,000 to the ledger linked to this transaction
          await tx.ledgerEntry.create({
            data: {
              walletId: wallet.id,
              amount: 10_000,
              direction: "CREDIT",
            },  
          });


          return createdUser;
    });

    // 10. Automatically inject realistic starter demo data
    try {
      await seedUserData(user.id);
    } catch (seedError) {
      console.error("Auto-seeding demo data failed for new user:", seedError);
    }

    return NextResponse.json(
      { message: "Signed up successfully", msg: "Signed up successfully" },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta?.target as string[]) || [];
      let conflictMsg = "A user with that phone number, email, or account number already exists";
      if (target.includes("number")) {
        conflictMsg = "A user with that phone number already exists";
      } else if (target.includes("email")) {
        conflictMsg = "A user with that email already exists";
      } else if (target.includes("accountNumber")) {
        conflictMsg = "Account number collision occurred. Please try again";
      }

      return NextResponse.json(
        { message: conflictMsg, msg: conflictMsg },
        { status: 409 },
      );
    }

    console.error("Signup failed:", error);

    return NextResponse.json(
      { message: "An error occurred while signing up", msg: "An error occurred while signing up" },
      { status: 500 },
    );
  }
};