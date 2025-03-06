import { Router } from "express";
import { getAllHashtags } from "../controllers/hashtag/get-all";

const router = Router();

router.get("/", getAllHashtags);

export default router;
