import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { text, hashtags, page = 1, itemsPerPage = 10 } = req.query;

    const hashtagsArray = hashtags ? (hashtags as string).split(",") : [];

    const pageNumber = parseInt(page as string, 10);
    const itemsCount = parseInt(itemsPerPage as string, 10);

    if (pageNumber < 1) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "O número da página deve ser maior que 0.",
      });
      return;
    }

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where: {
          text_content: {
            contains: text as string,
            mode: "insensitive",
          },
          parent_id: null,
          AND:
            hashtagsArray.length > 0
              ? {
                  hashtags: {
                    some: {
                      title: {
                        in: hashtagsArray,
                      },
                    },
                  },
                }
              : {},
        },
        include: {
          hashtags: {
            select: {
              title: true,
            },
          },
          author: true,
          likes: {
            select: {
              user_id: true,
            },
          },
        },
        skip: (pageNumber - 1) * itemsCount,
        take: itemsCount,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.post.count({
        where: {
          text_content: {
            contains: text as string,
          },
          AND:
            hashtagsArray.length > 0
              ? {
                  hashtags: {
                    some: {
                      title: {
                        in: hashtagsArray,
                      },
                    },
                  },
                }
              : {},
        },
      }),
    ]);

    res.status(StatusCodes.OK).json({
      posts,
      pagination: {
        totalItems: totalPosts,
        currentPage: pageNumber,
        itemsPerPage: itemsCount,
        totalPages: Math.ceil(totalPosts / itemsCount),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Ocorreu um erro ao buscar as postagens.",
    });
  }
};
