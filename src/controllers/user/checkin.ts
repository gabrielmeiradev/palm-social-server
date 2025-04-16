import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { accessTokenFromUser } from "../../utils/token";
import createUserIfNotExists from "../../services/user/checkIn";
import createGroupIfNotExists from "../../services/group/checkIn";
import { StatusCodes } from "http-status-codes";
import addUserToGroup from "../../services/group/addUser";

export async function checkInUser(req: Request, res: Response) {
  const { username, name, alias } = req.body;

  if (!username || !name || !alias) {
    res.status(400).json({ error: "Todos os campos são necessários" });
    return;
  }

  let userToken;
  let userCreated;

  try {
    const { user, wasCreated } = await createUserIfNotExists(username, name);

    userToken = accessTokenFromUser(user);

    if (wasCreated) {
      userCreated = user;
    } else {
      // if user was not created it means the user already have a group
      res.status(StatusCodes.OK).json({
        userToken,
      });
      return;
    }
  } catch (e) {
    let message = "Erro ao fazer check-in do usuário";
    console.log(message);
    res.status(500).json({ error: message, details: e });
    return;
  }

  let group;

  try {
    group = await createGroupIfNotExists(alias);
  } catch (e) {
    let message = "Erro ao fazer check-in do grupo";
    console.log(message);
    res.status(500).json({ error: message, details: e });
    return;
  }

  try {
    await addUserToGroup(group.group_id, userCreated.id);
  } catch (e) {
    let message = "Erro ao fazer adicionar usuário ao grupo";
    console.log(message);
    res.status(500).json({ error: message, details: e });
    return;
  }

  res.status(StatusCodes.OK).json({
    userToken,
  });

  return;
}
