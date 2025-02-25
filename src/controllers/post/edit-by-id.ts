import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromToken } from "../../utils/token";
import { PostCreationInput } from "./create";

const prisma = new PrismaClient();

export const editPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const author_id = req.headers["userid"];

  const { text_content, hashtags } = req.body as PostCreationInput;
  const hashtagsArray = hashtags
    .split(",")
    .map((hashtag) => hashtag.trim().toLowerCase());

  try {
    const existingPost = await prisma.post.findUnique({
      where: { post_id: id, author_id: author_id as string },
    });

    if (!existingPost) {
      res.status(404).json({ error: "Post não encontrado ou autorizado" });
      return;
    }

    await Promise.all(
      hashtagsArray.map(async (hashtag) => {
        await prisma.hashtag.upsert({
          where: { title: hashtag },
          update: {},
          create: { title: hashtag },
        });
      })
    );

    const post = await prisma.post.update({
      where: { post_id: id },
      data: {
        text_content,
        hashtags: {
          connect: hashtagsArray.map((hashtag) => ({ title: hashtag })),
        },
      },
      include: { hashtags: true },
    });

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao editar post" });
  }
};
