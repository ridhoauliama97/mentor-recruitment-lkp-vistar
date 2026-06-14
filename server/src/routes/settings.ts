import { Router } from "express";
import { exec, run, saveDb } from "../db/database.js";

const router = Router();

router.get("/", (_req, res) => {
  const rows = exec<{ key: string; value: string }>("SELECT key, value FROM app_settings");
  const settings: Record<string, string> = {};
  rows.forEach((r) => { settings[r.key] = r.value; });
  res.json(settings);
});

router.put("/", (req, res) => {
  const { app_name, institution } = req.body;
  if (app_name !== undefined) {
    run(`UPDATE app_settings SET value = '${app_name.replace(/'/g, "''")}' WHERE key = 'app_name'`);
  }
  if (institution !== undefined) {
    run(`UPDATE app_settings SET value = '${(institution ?? "").replace(/'/g, "''")}' WHERE key = 'institution'`);
  }
  saveDb();
  res.json({ success: true });
});

export default router;
