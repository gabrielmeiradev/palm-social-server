import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getCommentsById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const comments = await prisma.post.findMany({
    where: {
      parent_id: id,
    },
    include: {
      author: true,
      hashtags: true,
    },
  });

  res.status(200).json(comments);
};
