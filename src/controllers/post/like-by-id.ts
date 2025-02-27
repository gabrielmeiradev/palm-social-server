import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { getUserIdFromToken } from "../../utils/token";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const likePostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const userId = req.headers["userid"];

  try {
    const like = await prisma.like.findFirst({
      where: {
        post_id: id,
        user_id: userId as string,
      },
    });

    if (!like) {
      await prisma.like.create({
        data: {
          post_id: id,
          user_id: userId as string,
        },
      });

      await prisma.post.update({
        where: { post_id: id },
        data: {
          likes_count: {
            increment: 1,
          },
        },
      });

      res.status(StatusCodes.OK).json({ message: "Post curtido" });
    } else {
      await prisma.like.delete({
        where: {
          like_id: like.like_id,
        },
      });

      await prisma.post.update({
        where: { post_id: id },
        data: {
          likes_count: {
            decrement: 1,
          },
        },
      });
      res.status(StatusCodes.OK).json({ message: "Post descurtido" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao curtir o post" });
    return;
  }
};
