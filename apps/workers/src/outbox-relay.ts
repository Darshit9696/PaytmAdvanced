import { prisma } from '@repo/db/client';
import { notificationQueue } from "@repo/queue";


async function fetchUnpublishedEvents() {
    const events = await prisma.outBox.findMany({
        where: {
            publishedAt: null,
        },
        orderBy: {
            createdAt: 'asc',
        },
        take: 10,
    });

    return events;
}


async function publishEvents() {
    try {
        const events = await fetchUnpublishedEvents();

        for (const event of events) {
            try {
                const payload = JSON.parse(event.payLoad);

                await notificationQueue.add(
                    "transfer-notification",
                    { eventId: event.id, ...payload },
                    { jobId: event.id }
                );

                await prisma.outBox.update({
                    where: { id: event.id },
                    data: { publishedAt: new Date() },
                });
            } catch (err) {
                console.error(`Failed to publish event ${event.id}`, err);
                // leave publishedAt null -> it gets retried next poll
            }
        }
    } catch (err) {
        console.error("Failed to fetch unpublished events:", err);
    }
}

async function main() {
    while (true) {
        await publishEvents();
        await new Promise((r) => setTimeout(r, 2000)); // poll every 2s
    }
}


main().catch(console.error);