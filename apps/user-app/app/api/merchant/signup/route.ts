import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@repo/db/client";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { businessName, ownerName, email, phone, password, confirmPassword } = body;

    // 1. Validate required fields
    if (!businessName || !ownerName || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    const phoneClean = phone.trim();

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // 3. Validate phone format (10-digit phone number)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneClean)) {
      return NextResponse.json(
        { message: "Phone number must be a valid 10-digit number" },
        { status: 400 }
      );
    }

    // 4. Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // 5. Check if email already exists
    const existingEmail = await prisma.merchant.findUnique({
      where: { email: emailClean },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: "A merchant with this email already exists" },
        { status: 400 }
      );
    }

    // 6. Check if phone already exists
    const existingPhone = await prisma.merchant.findUnique({
      where: { phone: phoneClean },
    });

    if (existingPhone) {
      return NextResponse.json(
        { message: "A merchant with this phone number already exists" },
        { status: 400 }
      );
    }

    // 7. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. Create the merchant
    const merchant = await prisma.merchant.create({
      data: {
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        email: emailClean,
        phone: phoneClean,
        password: hashedPassword,
        authType: "CREDENTIALS",
        balance: 0,
      },
    });

    return NextResponse.json(
      {
        message: "Merchant account created successfully",
        merchant: {
          id: merchant.id,
          businessName: merchant.businessName,
          ownerName: merchant.ownerName,
          email: merchant.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Merchant Signup Error:", error);
    return NextResponse.json(
      {
        message: "An error occurred during merchant signup",
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
};
