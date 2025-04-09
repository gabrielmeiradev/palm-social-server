import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const getAllHashtags = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  try {
    const hashtags = await prisma.hashtag.findMany({
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      select: {
        title: true,
      },
    });

    const totalHashtags = await prisma.hashtag.count();
    const totalPages = Math.ceil(totalHashtags / limitNumber);

    res.status(StatusCodes.OK).json({
      hashtags,
      pagination: {
        totalHashtags,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Falha ao buscar hashtags" });
  }
};
