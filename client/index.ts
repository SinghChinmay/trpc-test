// Importing necessary modules from tRPC client and server
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server';
import './polyfill'; // Importing any necessary polyfills

// Creating a tRPC proxy client for our application
// This client will connect to the server at localhost:3000/trpc
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

async function main() {
  // Querying the list of users from the server
  // Using the userList endpoint provided by the tRPC client
  const users = await trpc.userList.query();

  // Logging the list of users to the console
  console.log('Users:', users);

  // Creating a new user using the userCreate endpoint provided by the tRPC client
  // We pass in the user's name, age, and gender as parameters
  const createdUser = await trpc.userCreate.mutate({
    name: 'sachinraja',
    age: 25,
    gender: 'M',
  });

  // Logging the newly created user to the console
  console.log('Created user:', createdUser);

  // Querying for a specific user by their ID using the userById endpoint provided by the tRPC client
  // In this case, we're querying for the user with an ID of 1
  const user = await trpc.userById.query('1');

  // Logging the user with ID 1 to the console
  console.log('User 1:', user);
}

// Running the main function
// If any errors are encountered, they will be caught and logged to the console
main().catch((err) => {
  console.error(
    'An unexpected error occurred: -------------------------------',
  );
  console.error(err);
  process.exit(1); // Exiting the process with a failure code (1)
});
