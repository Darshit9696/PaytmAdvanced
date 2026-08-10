import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db/client";

export const GET = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const merchantId = Number(session.user.id);

  if (isNaN(merchantId)) {
    return NextResponse.json({ message: "Invalid session user ID" }, { status: 400 });
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      businessName: true,
      ownerName: true,
      email: true,
      phone: true,
      balance: true,
      createdAt: true,
    },
  });

  if (!merchant) {
    return NextResponse.json({ message: "Merchant not found" }, { status: 404 });
  }

  return NextResponse.json({ merchant });
};
