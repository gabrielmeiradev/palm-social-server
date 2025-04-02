import { PrismaClient } from "@prisma/client";
// import { getUserIdFromToken } from "../../utils/token";
import { Request, Response } from "express";
import { genesisGroup } from "../../server";
import { userModelFromToken } from "../../utils/token";

export type PostCreationInput = {
  parent_id?: string;
  text_content: string;
  hashtags: string;
  categories: string;
};

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  const { parent_id, text_content, hashtags, categories } =
    req.body as PostCreationInput;

  let hashtagsArray = hashtags?.split(",") ?? [];
  let categoriesArray = categories?.split(",") ?? [];

  hashtagsArray = [...new Set([...hashtagsArray])];

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
    const { IdUser } = userModelFromToken(req.headers.authorization!);

    const post = await prisma.post.create({
      data: {
        parent_id: parent_id ?? null,
        group_id: genesisGroup.group_id,
        text_content,
        author_id: IdUser,
        medias: images.map((image) => image.path),
        categories: {
          connect: categoriesArray.map((category) => ({
            category_id: category,
          })),
        },
        hashtags: {
          connectOrCreate: hashtagsArray.map((hashtag) => ({
            where: { title: hashtag.toLowerCase().replaceAll("#", "") },
            create: { title: hashtag.toLowerCase().replaceAll("#", "") },
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
