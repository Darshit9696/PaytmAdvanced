import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const dashboard = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }
   
    return (
        <>
           Welcome {session.user?.name}
        </>
    )
}

export default dashboard;