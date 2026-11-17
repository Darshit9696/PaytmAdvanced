import { Worker } from "bullmq";
import { connection } from "@repo/queue";
import { prisma } from "@repo/db/client";

const worker = new Worker("notifications", async (job) => {
    const { eventId, senderId, receiverId, amount } = job.data;
    // create sender + receiver notifications
    await prisma.notification.createMany({
        data : [
            {
                eventId,
                type: "TRANSFER_SENT",
                title: "Money sent",
                userId: senderId,
                message : `You sent ${amount} to user ${receiverId}`,
            },
            {
                eventId,
                type: "TRANSFER_RECEIVED",
                title: "Money received",
                userId : receiverId,
                message : `You received ${amount} from user ${senderId}`,
            },
        ],
        skipDuplicates : true,
    })

}, { connection });

worker.on("completed", (job) => console.log(`Job ${job.id} done`));
worker.on("failed", (job, err) => console.error(`Job ${job?.id} failed`, err));