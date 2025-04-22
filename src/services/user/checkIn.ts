import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateUserIfNotExistsOutput {
  user: User;
  wasCreated: boolean;
}

export default async function createUserIfNotExists(
  username: string,
  name: string,
  alias: string,
  id: string
): Promise<CreateUserIfNotExistsOutput> {
  const user = await prisma.user.upsert({
    where: { username },
    update: {
      username,
      name,
    },
    create: {
      id,
      username,
      name,
      profileImage: `http://server.palmapp.com.br:8090/imagens/${alias}/${id}.jpg`,
    },
  });

  const wasCreated = user.created_at.getTime() === user.updated_at.getTime();

  return { user, wasCreated };
}
