import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { accessTokenFromUser } from "../../utils/token";
import createUserIfNotExists from "../../services/user/checkIn";
import createGroupIfNotExists from "../../services/group/checkIn";
import { StatusCodes } from "http-status-codes";
import addUserToGroup from "../../services/group/addUser";
import getFirstGroupByUser from "../../services/group/getFirstByUser";

export async function checkInUser(req: Request, res: Response) {
  const { username, name, alias, id } = req.body;

  if (!username || !name || !alias || !id) {
    res.status(400).json({ error: "Todos os campos são necessários" });
    return;
  }

  let userToken;
  let isUserNew;
  let userEntity;
  let group;

  try {
    const { user, wasCreated } = await createUserIfNotExists(
      username,
      name,
      alias,
      id
    );

    userToken = accessTokenFromUser(user);

    isUserNew = wasCreated;
    userEntity = user;
    group = await getFirstGroupByUser(user.id);
  } catch (e) {
    let message = "Erro ao fazer check-in do usuário: " + e;
    console.log(message);
    res.status(500).json({ error: message, details: e });
    return;
  }

  if (isUserNew) {
    try {
      group = await createGroupIfNotExists(alias);
    } catch (e) {
      let message = "Erro ao fazer check-in do grupo";
      console.log(message);
      res.status(500).json({ error: message, details: e });
      return;
    }

    try {
      await addUserToGroup(group.group_id, userEntity.id);
    } catch (e) {
      let message = "Erro ao fazer adicionar usuário ao grupo";
      console.log(message);
      res.status(500).json({ error: message, details: e });
      return;
    }
  }
  console.log("Check-in realizado com sucesso");
  console.log({
    user: userEntity,
    token: userToken,
    group: group,
  });
  res.status(StatusCodes.OK).json({
    user: userEntity,
    token: userToken,
    group: group,
  });

  return;
}
