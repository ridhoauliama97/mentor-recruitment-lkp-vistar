import { Router } from "express";
import { exec, run } from "../db/database.js";

const router = Router();

router.get("/", async (_req, res) => {
  const rows = await exec<{ key: string; value: string }>("SELECT `key`, `value` FROM app_settings");
  const settings: Record<string, string> = {};
  rows.forEach((r) => { settings[r.key] = r.value; });
  res.json(settings);
});

router.put("/", async (req, res) => {
  const { app_name, institution } = req.body;
  if (app_name !== undefined) {
    await run("UPDATE app_settings SET `value` = ? WHERE `key` = 'app_name'", [app_name]);
  }
  if (institution !== undefined) {
    await run("UPDATE app_settings SET `value` = ? WHERE `key` = 'institution'", [institution]);
  }
  res.json({ success: true });
});

export default router;
