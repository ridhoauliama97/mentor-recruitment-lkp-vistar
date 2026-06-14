import express from "express";
import cors from "cors";
import { Router } from "express";
import { initDb } from "./db/database.js";
import { runSchema } from "./db/schema.js";
import { seed, seedSettings } from "./db/seed.js";
import { verifyToken } from "./middleware/auth.js";
import authRouter from "./routes/auth.js";
import criteriaRouter, { subRouter } from "./routes/criteria.js";
import candidatesRouter from "./routes/candidates.js";
import psiRouter from "./routes/psi.js";
import dashboardRouter from "./routes/dashboard.js";
import settingsRouter from "./routes/settings.js";
import exportRouter from "./routes/export.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const apiRouter = Router();
apiRouter.use(verifyToken);
apiRouter.use("/criteria", criteriaRouter);
apiRouter.use("/sub-criteria", subRouter);
apiRouter.use("/candidates", candidatesRouter);
apiRouter.use("/psi", psiRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/export", exportRouter);
app.use("/api", apiRouter);

async function start() {
  await initDb();
  runSchema();
  seed();
  seedSettings();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
