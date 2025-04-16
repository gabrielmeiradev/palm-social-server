import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getGroupById(id: string) {
  const group = await prisma.group.findUnique({
    where: {
      group_id: id,
    },
    include: {
      users: true,
    },
  });

  if (!group) {
    throw new Error("Grupo não encontrado");
  }

  return group;
}
