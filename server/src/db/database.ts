import fs from "fs";
import path from "path";
import initSqlJs, { Database as SqlJsDatabase } from "sql.js";

const DB_PATH = path.join(import.meta.dirname, "..", "..", "data", "mentor-psi.db");

let db: SqlJsDatabase;

export async function initDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } catch {
    db = new SQL.Database();
  }
  db.run("PRAGMA journal_mode=WAL");
  db.run("PRAGMA foreign_keys=ON");
  return db;
}

export function getDb() {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  return db;
}

export function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function run(sql: string) {
  return getDb().run(sql);
}

export function execSql(sql: string) {
  return getDb().exec(sql);
}

export function exec<T = Record<string, unknown>>(sql: string): T[] {
  const result = getDb().exec(sql);
  if (result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map((row: unknown[]) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col: string, i: number) => {
      const camelCol = col.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());
      obj[camelCol] = row[i];
    });
    return obj as T;
  });
}

export function get<T = Record<string, unknown>>(sql: string): T | undefined {
  const rows = exec<T>(sql);
  return rows[0];
}
