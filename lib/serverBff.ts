import { z } from 'zod';
import { publicProcedure, router } from '../server/trpc'; // adjust this import path as needed
import { db } from '../server/db';

const routesForTrpc = {
  userList: publicProcedure.query(async () => {
    const users = await db.user.findMany();
    return users;
  }),
  userCreate: publicProcedure
    .input(
      z.object({
        name: z.string(), // The user's name must be a string
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;
      // Create a new user in the database with the provided input
      const user = await db.user.create(input);
      return user;
    }),
  getUserSecret: publicProcedure.query(async () => {
    return 'secret';
  }),
};

// Define the application router with tRPC procedures
export const appRouter = router(routesForTrpc);

export type AppRouter = typeof appRouter;
