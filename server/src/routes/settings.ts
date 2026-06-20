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
  const { app_name, institution, gemini_api_key } = req.body;
  if (app_name !== undefined) {
    await run("UPDATE app_settings SET `value` = ? WHERE `key` = 'app_name'", [app_name]);
  }
  if (institution !== undefined) {
    await run("UPDATE app_settings SET `value` = ? WHERE `key` = 'institution'", [institution]);
  }
  if (gemini_api_key !== undefined) {
    const existing = await exec("SELECT `value` FROM app_settings WHERE `key` = 'gemini_api_key'");
    if (existing.length > 0) {
      await run("UPDATE app_settings SET `value` = ? WHERE `key` = 'gemini_api_key'", [gemini_api_key]);
    } else {
      await run("INSERT INTO app_settings (`key`, `value`) VALUES ('gemini_api_key', ?)", [gemini_api_key]);
    }
  }
  res.json({ success: true });
});

export default router;
