import { Group, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function getFirstGroupByUser(
  userId: string
): Promise<Group | null> {
  const group = prisma.group.findFirst({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
  });

  return group;
}
