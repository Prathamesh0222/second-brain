import express from "express";
import userRouter from "./Router/userRouter";
import contentRouter from "./Router/contentRouter";
import { config } from "dotenv";
import cors from "cors";

config();
const app = express();
app.use(express.json());

const corsOptions = {
  origin: ["https://second-brain-lake.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use("/api/v1", userRouter);
app.use("/api/v1", contentRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT || "", () => {
  console.log(`Server running at ${PORT}`);
});
