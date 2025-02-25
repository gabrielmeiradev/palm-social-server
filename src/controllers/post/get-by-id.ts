import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      post_id: id,
    },
    include: {
      hashtags: true,
    },
  });

  res.status(StatusCodes.OK).json(post);
};
