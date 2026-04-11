import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import urlRoutes from "./routes/urlRoutes.js";
import { redirectUrl } from "./controllers/urlController.js";


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", urlRoutes);
app.get("/:shortId", redirectUrl);

app.get("/", (req, res) => {
  res.send("Distributed URL Shortener API");
});

export default app;