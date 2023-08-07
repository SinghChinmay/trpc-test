import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { db } from './db'; // make sure to import your db here
import { appRouter } from '../lib/serverBff'; // adjust this import path as needed
import { inferAsyncReturnType } from '@trpc/server';

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

export type Context = inferAsyncReturnType<typeof createContext>;

const app = express();

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter, // The defined tRPC router
    createContext, // The defined context function
  }),
);

// Define a root route for the application
app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Listening on http://localhost:3000/trpc');
});
