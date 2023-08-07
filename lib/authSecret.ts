import { publicProcedure, router } from '../server/trpc'; // adjust this import path as needed
import { Authtrpc } from '../serviceAuth/index';

const routesForTrpc = {
  getSecret: publicProcedure.query(async () => {
    return Authtrpc.getUserSecret.query();
  }),
};

// Define the application router with tRPC procedures
export const authRouter = router(routesForTrpc);

export type AuthRouter = typeof authRouter;
