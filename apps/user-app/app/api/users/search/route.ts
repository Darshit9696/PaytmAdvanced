import { prisma } from "@repo/db/client";

export const GET = async (request: Request) => {

    console.log(request.url);
    const { searchParams } = new URL(request.url);
    console.log(searchParams);

    const query = searchParams.get("query") || "";
    console.log(query);


    const users = await prisma.user.findMany({
        where: {
            name: {
                contains: query!,
                mode: "insensitive",
            }
        },
        select : {
            id : true,
            name : true,
            number : true,
        }
    })

    return new Response(JSON.stringify(users), {
        status : 200,
    })
}