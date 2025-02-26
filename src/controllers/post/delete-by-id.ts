import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const deletePostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const author_id = req.headers["userid"];

  try {
    await prisma.like.deleteMany({
      where: {
        post_id: id,
      },
    });

    const post = await prisma.post.findUnique({
      where: {
        post_id: id,
      },
    });

    if (!post || post.author_id !== author_id) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Não autorizado" });
      return;
    }

    await prisma.post.deleteMany({
      where: {
        OR: [
          {
            post_id: id,
            author_id: author_id as string,
          },
          {
            parent_id: id,
          },
        ],
      },
    });

    res.status(StatusCodes.OK).json({ message: "Post deletado" });
    return;
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Falha ao deletar post" });
    return;
  }
};
