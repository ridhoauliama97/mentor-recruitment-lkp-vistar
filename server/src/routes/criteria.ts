import { Router } from "express";
import { exec, run } from "../db/database.js";

const router = Router();

router.get("/", async (_req, res) => {
  const criteria = await exec("SELECT * FROM criteria ORDER BY id");
  res.json(criteria);
});

router.post("/", async (req, res) => {
  const { name, description, type, unit, code, weightRef, status } = req.body;
  if (!name || !type) {
    res.status(400).json({ message: "Nama dan tipe kriteria wajib diisi" });
    return;
  }
  await run(
    "INSERT INTO criteria (name, description, type, unit, code, weight_ref, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, description ?? "", type, unit ?? "", code ?? "", weightRef ?? 0, status ?? "active"],
  );
  const criteria = await exec("SELECT * FROM criteria ORDER BY id");
  res.status(201).json(criteria);
});

router.put("/:id", async (req, res) => {
  const { name, description, type, unit, code, weightRef, status } = req.body;
  await run(
    "UPDATE criteria SET name = ?, description = ?, type = ?, unit = ?, code = ?, weight_ref = ?, status = ? WHERE id = ?",
    [name ?? "", description ?? "", type, unit ?? "", code ?? "", weightRef ?? 0, status ?? "active", req.params.id],
  );
  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  await run("DELETE FROM criteria WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

router.get("/:id/sub-criteria", async (req, res) => {
  const subCriteria = await exec(
    "SELECT * FROM sub_criteria WHERE criteria_id = ? ORDER BY display_order",
    [req.params.id],
  );
  res.json(subCriteria);
});

router.post("/:id/sub-criteria", async (req, res) => {
  const { name, weight, displayOrder } = req.body;
  if (!name || !weight) {
    res.status(400).json({ message: "Nama dan bobot wajib diisi" });
    return;
  }
  await run(
    "INSERT INTO sub_criteria (criteria_id, name, weight, display_order) VALUES (?, ?, ?, ?)",
    [req.params.id, name, weight, displayOrder ?? 0],
  );
  const subCriteria = await exec(
    "SELECT * FROM sub_criteria WHERE criteria_id = ? ORDER BY display_order",
    [req.params.id],
  );
  res.status(201).json(subCriteria);
});

const subRouter = Router();

subRouter.put("/:id", async (req, res) => {
  const { name, weight, displayOrder } = req.body;
  await run(
    "UPDATE sub_criteria SET name = ?, weight = ?, display_order = ? WHERE id = ?",
    [name ?? "", weight, displayOrder ?? 0, req.params.id],
  );
  res.json({ success: true });
});

subRouter.delete("/:id", async (req, res) => {
  await run("DELETE FROM sub_criteria WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

export { subRouter };
export default router;
