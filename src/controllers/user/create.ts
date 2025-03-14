import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

interface CreateUserInput {
  username: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
  const { username, fullName, phone, email, password } =
    req.body as CreateUserInput;

  await prisma.user.create({
    data: {
      Nome: fullName,
      Email: email,
      Telefone: phone,
      Senha: password,
      Login: username,
      ProfileImage: "",
    },
  });

  res.status(200).json({ message: "User created" });
  return;
};
