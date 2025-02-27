// Dependencies
import express from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";

// Import routes
import postRouter from "./routes/post.routes";
import checkInRouter from "./routes/checkin.routes";
import { PrismaClient } from "@prisma/client";

// Setting up server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);
app.use("/uploads", express.static("uploads"));

// Prisma client to create genesis group
const prisma = new PrismaClient();

// Routes
app.use("/posts", postRouter);
app.use("/checkin", checkInRouter);

// Heartbeat
app.get("/heartbeat", (_, res) => {
  res.status(StatusCodes.OK).send("Beating!");
});

export let genesisGroup: {
  group_id: string;
  name: string;
};

// Server host
app.listen(3000, async () => {
  genesisGroup = await prisma.group.create({
    data: {
      name: "Genesis",
    },
  });

  console.log("Server is running on port 3000");
});
