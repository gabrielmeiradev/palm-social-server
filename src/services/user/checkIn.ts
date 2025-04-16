import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateUserIfNotExistsOutput {
  user: User;
  wasCreated: boolean;
}

export default async function createUserIfNotExists(
  username: string,
  name: string
): Promise<CreateUserIfNotExistsOutput> {
  const user = await prisma.user.upsert({
    where: { username },
    update: {
      username,
      name,
    },
    create: {
      username,
      name,
    },
  });

  const wasCreated = user.created_at.getTime() === user.updated_at.getTime();

  return { user, wasCreated };
}
