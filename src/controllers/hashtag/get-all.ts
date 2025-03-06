import { Request, Response } from "express";

import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const getAllHashtags = async (_: Request, res: Response) => {
  try {
    const hashtags = await prisma.hashtag.findMany({
      select: {
        title: true,
      },
    });

    res.status(StatusCodes.OK).json(hashtags);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Falha ao buscar hashtags" });
  }
};
