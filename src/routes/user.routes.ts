import multer from "multer";

import { Router } from "express";

import { createUser } from "../controllers/user/create";

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
  const allowedExtensions = ["jpg", "jpeg", "png"];
  const extension = file.originalname.split(".").pop()?.toLowerCase();

  if (
    /^image\//.test(file.mimetype) &&
    extension &&
    allowedExtensions.includes(extension)
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

const userRouter = Router();

userRouter.post("/", upload.array("media"), createUser);

export default userRouter;
