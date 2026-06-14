import { Router } from "express";
import { exec, run, saveDb } from "../db/database.js";

const router = Router();

router.get("/", (_req, res) => {
  const criteria = exec("SELECT * FROM criteria ORDER BY id");
  res.json(criteria);
});

router.post("/", (req, res) => {
  const { name, description, type, unit, code, weightRef, status } = req.body;
  if (!name || !type) {
    res.status(400).json({ message: "Nama dan tipe kriteria wajib diisi" });
    return;
  }
  run(`INSERT INTO criteria (name, description, type, unit, code, weight_ref, status) VALUES (
    '${name.replace(/'/g, "''")}',
    '${(description ?? "").replace(/'/g, "''")}',
    '${type}',
    '${(unit ?? "").replace(/'/g, "''")}',
    '${(code ?? "").replace(/'/g, "''")}',
    ${weightRef ?? 0},
    '${status ?? "active"}'
  )`);
  saveDb();
  const criteria = exec("SELECT * FROM criteria ORDER BY id");
  res.status(201).json(criteria);
});

router.put("/:id", (req, res) => {
  const { name, description, type, unit, code, weightRef, status } = req.body;
  run(`UPDATE criteria SET
    name = '${(name ?? "").replace(/'/g, "''")}',
    description = '${(description ?? "").replace(/'/g, "''")}',
    type = '${type}',
    unit = '${(unit ?? "").replace(/'/g, "''")}',
    code = '${(code ?? "").replace(/'/g, "''")}',
    weight_ref = ${weightRef ?? 0},
    status = '${status ?? "active"}'
    WHERE id = ${req.params.id}
  `);
  saveDb();
  res.json({ success: true });
});

router.delete("/:id", (req, res) => {
  run(`DELETE FROM criteria WHERE id = ${req.params.id}`);
  saveDb();
  res.json({ success: true });
});

router.get("/:id/sub-criteria", (req, res) => {
  const subCriteria = exec(
    `SELECT * FROM sub_criteria WHERE criteria_id = ${req.params.id} ORDER BY display_order`,
  );
  res.json(subCriteria);
});

router.post("/:id/sub-criteria", (req, res) => {
  const { name, weight, displayOrder } = req.body;
  if (!name || !weight) {
    res.status(400).json({ message: "Nama dan bobot wajib diisi" });
    return;
  }
  run(`INSERT INTO sub_criteria (criteria_id, name, weight, display_order) VALUES (
    ${req.params.id},
    '${name.replace(/'/g, "''")}',
    ${weight},
    ${displayOrder ?? 0}
  )`);
  saveDb();
  const subCriteria = exec(
    `SELECT * FROM sub_criteria WHERE criteria_id = ${req.params.id} ORDER BY display_order`,
  );
  res.status(201).json(subCriteria);
});

const subRouter = Router();

subRouter.put("/:id", (req, res) => {
  const { name, weight, displayOrder } = req.body;
  run(`UPDATE sub_criteria SET
    name = '${(name ?? "").replace(/'/g, "''")}',
    weight = ${weight},
    display_order = ${displayOrder ?? 0}
    WHERE id = ${req.params.id}
  `);
  saveDb();
  res.json({ success: true });
});

subRouter.delete("/:id", (req, res) => {
  run(`DELETE FROM sub_criteria WHERE id = ${req.params.id}`);
  saveDb();
  res.json({ success: true });
});

export { subRouter };
export default router;
