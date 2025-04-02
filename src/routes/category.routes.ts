import { Router } from "express";
import { getAllCategories } from "../category/get-all";

const categoryRouter = Router();

categoryRouter.get("/", getAllCategories);

export default categoryRouter;
