import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { getUserIdFromToken } from "../../utils/token";
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

    await prisma.post.delete({
      where: {
        post_id: id,
        author_id: author_id as string,
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
