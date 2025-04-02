import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllCategories = async (_: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar categorias" });
  }
};
