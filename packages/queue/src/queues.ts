import { Queue } from "bullmq";
import { connection } from "./connection";

const defaultJobOptions = {
    attempts: 5,

    backoff: {
        type: "exponential" as const,
        delay: 2000,
    },

    removeOnComplete: 1000,
    removeOnFail: false,
};

export const notificationQueue = new Queue(
    "notifications",
    { 
        connection,
        defaultJobOptions,
    }
);

export const webhookQueue = new Queue(
    "webhooks",
    { 
        connection,
        defaultJobOptions,
    }
);
