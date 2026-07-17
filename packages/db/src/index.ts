// Imagine your code just had export const prisma = new PrismaClient();.

// You start your local Next.js server. index.ts runs. Connection #1 is opened with Neon.

// You edit a button's padding in your frontend and hit save.

// Next.js triggers Fast Refresh. It completely wipes out the running module state and re-executes index.ts from scratch to apply your changes.

// index.ts hits that line again: new PrismaClient(). Connection #2 opens. The old connection is trapped in memory, hanging wide open.

// You make 15 to 20 code changes while building your app. Suddenly, Neon blocks your app with a "Fatal: too many connections" error. Your database crashes because it's handling 20 ghost connections from a single user.

// Scenario B: The Good Way (With this snippet)
// Now look at what happens with our global object strategy:

// You start your local server. globalThis.prisma is empty (undefined).

// The code runs, realizes it's empty, spawns new PrismaClient(), and assigns it to globalThis.prisma. Connection #1 opens.

// You edit your code and hit save. Next.js clears the file modules and re-executes index.ts.

// The code checks: globalForPrisma.prisma || new PrismaClient().

// This time, globalThis.prisma already exists! It completely skips the new PrismaClient() constructor and hand-delivers the original connection right back to your app.

// Your active database connections stay locked at exactly 1, no matter how many hundreds of times you save your files.
// >>>>>>> 8b77c0e (feat: add shared Zustand store and initial database setup)
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
    