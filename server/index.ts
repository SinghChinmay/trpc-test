import { z } from 'zod';
import { db } from './db';
import { publicProcedure, router } from './trpc';
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  return {
    req,
    res,
    db,
  };
};

export const appRouter = router({
  userList: publicProcedure.query(async () => {
    // Retrieve users from a datasource, this is an imaginary database
    const users = await db.user.findMany();
    return users;
  }),
  userById: publicProcedure.input(z.string()).query(async (opts) => {
    const { input } = opts;
    // Retrieve the user with the given ID
    const user = await db.user.findById(input);
    return user;
  }),
  userCreate: publicProcedure
    .input(
      z.object({
        name: z.string(),
        age: z.number(),
        gender: z.enum(['M', 'F']), // 'M' for male, 'F' for female
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;
      const user = await db.user.create(input);
      return user;
    }),
});

export type AppRouter = typeof appRouter;

type Context = inferAsyncReturnType<typeof createContext>;

// Create a new TRPC instance
const t = initTRPC.context<Context>().create();

const app = express();

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.get('/', (req, res) => {
  res.send(`
    <h1>TRPC Example</h1>
    <p>Try <a href="/trpc/userList">/trpc/userList</a></p>
    <p>Try <a href="/trpc/userById?input=1">/trpc/userById?input=1</a></p>
    <p>Try <a href="/trpc/userCreate?input[name]=John">/trpc/userCreate?input[name]=John</a></p>
  `);
});

app.listen(3000, () => {
  console.log('Listening on http://localhost:3000/trpc');
});
