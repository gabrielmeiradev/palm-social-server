import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { generateAccessToken } from "../utils/token";

const checkInRouter = Router();
const prisma = new PrismaClient();

type CheckInInput = {
  username: string;
};

checkInRouter.post("/", async (req, res) => {
  try {
    const { username } = req.body as CheckInInput;
    const userId = req.headers["userid"];

    const profile_image = `https://api.palmapp.com.br/imagens/carnivor/${userId}.jpg`;

    const createUserIfNotExists = async () => {
      let user = await prisma.user.findUnique({
        where: { username: username },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            user_id: userId as string,
            username: username,
            profile_image: profile_image,
          },
        });
      }

      return user;
    };

    const user = await createUserIfNotExists();

    res.status(201).send({ message: "User checked in" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

export default checkInRouter;
