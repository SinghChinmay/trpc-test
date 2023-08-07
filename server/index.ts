// Importing necessary libraries and modules
import { z } from 'zod'; // For schema validation
import { db } from './db'; // Database connection
import { publicProcedure, router } from './trpc'; // tRPC server-side utilities
import { inferAsyncReturnType, initTRPC } from '@trpc/server'; // tRPC initialization
import * as trpcExpress from '@trpc/server/adapters/express'; // tRPC Express adapter
import express from 'express'; // Express.js web server

// Create a context function for tRPC, which provides additional data for each request
// Here it provides the request, response, and database connection
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

const routesForTrpc = {
  // Define a userList procedure for getting all users
  userList: publicProcedure.query(async () => {
    // Retrieve users from the database
    const users = await db.user.findMany();
    return users;
  }),
  // Define a userById procedure for getting a user by ID
  userById: publicProcedure.input(z.string()).query(async (opts) => {
    const { input } = opts;
    // Retrieve the user with the given ID from the database
    const user = await db.user.findById(input);
    return user;
  }),
  // Define a userCreate procedure for creating a new user
  userCreate: publicProcedure
    .input(
      z.object({
        name: z.string(), // The user's name must be a string
        age: z.number(), // The user's age must be a number
        gender: z.enum(['M', 'F']), // The user's gender must be either 'M' or 'F'
        phone: z.string(), // The user's phone number is optional
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;
      // Create a new user in the database with the provided input
      const user = await db.user.create(input);
      return user;
    }),
  deleteUser: publicProcedure
    .input(
      z.object({
        id: z.string(), // The user's name must be a string
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;
      // Create a new user in the database with the provided input
      const user = await db.user.delete(input);
      return user;
    }),
};

// Define the application router with tRPC procedures
export const appRouter = router(routesForTrpc);

export type AppRouter = typeof appRouter;

type Context = inferAsyncReturnType<typeof createContext>;

// Initialize a new tRPC instance with the defined context
const t = initTRPC.context<Context>().create();

// Initialize a new Express application
const app = express();

// Use the tRPC Express middleware for the '/trpc' route
// This allows the application to handle tRPC requests
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter, // The defined tRPC router
    createContext, // The defined context function
  }),
);

// check if cookie is set auth=true
app.use((req: any, res, next) => {
  if (req.cookies?.auth) {
    req.user = {
      id: '1',
      name: 'sachinraja',
      age: 25,
    };

    next();
  }
  res.redirect('/login');
});

// Define a root route for the application
app.get('/', (req, res) => {
  res.send(`
    <h1>TRPC Example</h1>
    <p>Try <a href="/trpc/userList">/trpc/userList</a></p>
    <p>Try <a href="/trpc/userById?input=1">/trpc/userById?input=1</a></p>
    <p>Try <a href="/trpc/userCreate?input[name]=John">/trpc/userCreate?input[name]=John</a></p>
  `);
});

// Start the Express server on port 3000
app.listen(3000, () => {
  console.log('Listening on http://localhost:3000/trpc'); // Log that the server is running
});
