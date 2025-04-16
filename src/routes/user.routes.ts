import { Router } from "express";

import { checkInUser } from "../controllers/user/checkin";

const userRouter = Router();

userRouter.post("/checkin", checkInUser);

export default userRouter;
