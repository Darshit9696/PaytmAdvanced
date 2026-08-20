import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Update to your correct auth config path
import { redirect } from "next/navigation";
import { prisma } from "@repo/db/client";
import ProfileView from "@/components/ProfileView";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role === "merchant") {
    redirect("/dashboard/merchant");
  }

  // Fetch the absolute source of truth directly from PostgreSQL on the server
  const dbUser = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
    select: {
      id: true,
      name: true,
      email: true,
      number: true, 
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // Pass it directly into your clean UI view component
  return <ProfileView user={dbUser} />;
}