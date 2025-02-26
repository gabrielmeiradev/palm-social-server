import { PrismaClient } from "@prisma/client";
// import { getUserIdFromToken } from "../../utils/token";
import { Request, Response } from "express";
import { genesisGroup } from "../../server";

export type PostCreationInput = {
  parent_id?: string;
  text_content: string;
  hashtags: string;
};

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  const author_id = req.headers["userid"];

  const { parent_id, text_content, hashtags } = req.body as PostCreationInput;

  const hashtagsArray = hashtags.split(",");

  const images = req.files as Express.Multer.File[];

  if (parent_id) {
    try {
      const parentPost = await prisma.post.update({
        where: { post_id: parent_id },
        data: {
          comments_count: {
            increment: 1,
          },
        },
      });

      if (!parentPost) {
        res.status(404).json({ error: "Post pai não encontrado" });
        return;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Falha ao buscar post pai" });
      return;
    }
  }

  try {
    const post = await prisma.post.create({
      data: {
        parent_id: parent_id ?? null,
        group_id: genesisGroup.group_id,
        text_content,
        author_id: author_id as string,
        medias: images.map((image) => image.path),
        hashtags: {
          connectOrCreate: hashtagsArray.map((hashtag) => ({
            where: { title: hashtag.toLowerCase() },
            create: { title: hashtag.toLowerCase() },
          })),
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao criar post" });
  }
};
