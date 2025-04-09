import { Router } from "express";
import { getAllCategories } from "../controllers/category/get-all";

const categoryRouter = Router();

categoryRouter.get("/", getAllCategories);

export default categoryRouter;
