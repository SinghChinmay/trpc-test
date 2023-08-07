type User = { id: string; name: string };

// Imaginary database
const users: User[] = [];
export const db = {
  user: {
    findMany: async () => users,
    findById: async (id: string) => users.find((user) => user.id === id),
    create: async (data: { name: string }) => {
      const user = { id: String(users.length + 1), ...data };
      users.push(user);
      return user;
    },
    delete: async (data: { id: string }) => {
      const user = users.find((user) => user.id === data.id);
      if (!user) {
        throw new Error('User not found');
      }
      users.splice(users.indexOf(user), 1);
      return user;
    },
  },
};
