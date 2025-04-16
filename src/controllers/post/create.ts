import { $Enums, PrismaClient } from "@prisma/client";
// import { getUserIdFromToken } from "../../utils/token";
import { Request, Response } from "express";

import { userModelFromToken } from "../../utils/token";
import { StatusCodes } from "http-status-codes";
import getGroupById from "../../services/group/getById";

export type PostCreationInput = {
  parent_id?: string;
  text_content: string;
  hashtags: string;
  categories: string;
  group_id?: string;
};

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  const { group_id, parent_id, text_content, hashtags, categories } =
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
        res.status(404).json({ message: "Post pai não encontrado" });
        return;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Falha ao buscar post pai" });
      return;
    }
  }

  if (!group_id) {
    res.status(400).json({ message: "Grupo não informado" });
    return;
  }

  try {
    const group = await getGroupById(group_id);

    const isUserInGroup = group.users.find(
      (user) => user.id === userModelFromToken(req.headers.authorization!).id
    );
    if (!isUserInGroup) {
      res.status(403).json({ message: "Usuário não pertence ao grupo" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Falha ao buscar grupo", details: error });
    return;
  }

  try {
    const { id } = userModelFromToken(req.headers.authorization!);

    if (!id) {
      res.status(401).json({ message: "Usuário não autenticado" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    let isAdvertiser = false;

    if (user.type === $Enums.UserType.Advertiser) {
      isAdvertiser = true;

      const lastPost = await prisma.post.findFirst({
        where: {
          author_id: id,
        },
        orderBy: {
          created_at: "desc",
        },
        take: 1,
      });

      if (lastPost) {
        const lastPostDate = new Date(lastPost.created_at);
        const currentDate = new Date();
        const timeDifference = currentDate.getTime() - lastPostDate.getTime();
        const hoursDifference = timeDifference / (1000 * 60 * 60);

        if (hoursDifference < 24) {
          res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Você só pode criar um post a cada 24 horas.",
          });
          return;
        }
      }
    }

    const post = await prisma.post.create({
      data: {
        parent_id: parent_id ?? null,
        group_id: group_id,
        text_content,
        author_id: id,
        medias: images.map((image) => image.path),
        is_advertisement: isAdvertiser,
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
    res.status(500).json({ message: "Falha ao criar post" });
  }
};
