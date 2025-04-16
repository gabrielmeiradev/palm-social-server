import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { userModelFromToken } from "../../utils/token";

const prisma = new PrismaClient();

export const likePostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const author_id = userModelFromToken(req.headers.authorization!).id;

  try {
    const like = await prisma.like.findFirst({
      where: {
        post_id: id,
        user_id: author_id as string,
      },
    });

    if (!like) {
      await prisma.like.create({
        data: {
          post_id: id,
          user_id: author_id as string,
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
    res.status(500).json({ message: "Falha ao curtir o post" });
    return;
  }
};
