import { NextFunction, Request, Response } from "express";
import { checkAccessToken } from "../utils/token";

export default function checkToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ message: "Token não informado" });
    return;
  }

  try {
    token = token.replace("Bearer ", "");
    checkAccessToken(token);
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
    return;
  }
}
