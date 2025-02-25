import multer from "multer";

import { Router } from "express";

import { createPost } from "../controllers/post/create";
import { getPostById } from "../controllers/post/get-by-id";
import { likePostById } from "../controllers/post/like-by-id";
import { deletePostById } from "../controllers/post/delete-by-id";
import { editPostById } from "../controllers/post/edit-by-id";
import { getAllPosts } from "../controllers/post/get-all";
import { getCommentsById } from "../controllers/post/get-comments-by-id";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const postRouter = Router();

postRouter.get("/", getAllPosts);

postRouter.post("/", upload.array("media"), createPost);

postRouter.get("/:id", getPostById);

postRouter.delete("/:id", deletePostById);

postRouter.put("/:id", editPostById);

postRouter.post("/:id/like", likePostById);

postRouter.get("/:id/comments", getCommentsById);

export default postRouter;
