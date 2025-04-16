import { PrismaClient, Group } from "@prisma/client";

const prisma = new PrismaClient();

export default function addUserToGroup(
  groupId: string,
  userId: string
): Promise<Group> {
  const group = prisma.group.update({
    where: {
      group_id: groupId,
    },
    data: {
      users: {
        connect: { id: userId },
      },
    },
  });

  return group;
}
