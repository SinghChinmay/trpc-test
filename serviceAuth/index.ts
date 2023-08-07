import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from '../lib/serverBff';
import { authRouter } from '../lib/authSecret';
import { inferAsyncReturnType } from '@trpc/server';
import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';

export const Authtrpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

async function main() {
  const users = await Authtrpc.userList.query();
  console.log('Allowed Users:', users);

  const addUser = await Authtrpc.userCreate.mutate({
    name: 'Jane Doe',
  });

  console.log('Added User:', addUser);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  return {
    req,
    res,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;

const app = express();

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: authRouter, // The defined tRPC router
    createContext, // The defined context function
  }),
);

app.listen(4000, () => {
  console.log('Listening on http://localhost:4000/trpc/getSecret');
});
