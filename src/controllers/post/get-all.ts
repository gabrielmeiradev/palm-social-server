import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const getAllPosts = async (req: Request, res: Response) => {
  const { text, hashtags, page = 1, itemsPerPage = 10 } = req.query;

  const hashtagsArray = hashtags ? (hashtags as string).split(",") : [];

  const pageNumber = parseInt(page as string, 10);
  const itemsCount = parseInt(itemsPerPage as string, 10);

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: {
        text_content: {
          contains: text as string,
          mode: "insensitive",
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
      include: {
        hashtags: {
          select: {
            title: true,
          },
        },
        author: true,
      },
      skip: (pageNumber - 1) * itemsCount,
      take: itemsCount,
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
};
