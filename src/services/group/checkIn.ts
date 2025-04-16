import { Group, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function createGroupIfNotExists(
  alias: string
): Promise<Group> {
  const group = await prisma.group.upsert({
    where: { alias },
    update: {},
    create: {
      alias,
    },
  });
  return group;
}
