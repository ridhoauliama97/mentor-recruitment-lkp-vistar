import mysql from "mysql2/promise";

let pool: mysql.Pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "rekrutmen_mentor_psi",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function run(sql: string, params?: unknown[]) {
  const [result] = await getPool().execute<mysql.ResultSetHeader>(sql, params as any);
  return result;
}

export async function exec<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
  const [rows] = await getPool().query(sql, params as any);
  return (rows as Record<string, unknown>[]).map((row) => {
    const obj: Record<string, unknown> = {};
    for (const key of Object.keys(row)) {
      const camelKey = key.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());
      obj[camelKey] = (row as Record<string, unknown>)[key];
    }
    return obj as T;
  });
}

export async function execSql(sql: string) {
  await getPool().query(sql);
}

export async function transaction<T>(cb: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.query("START TRANSACTION");
    const result = await cb(conn);
    await conn.query("COMMIT");
    return result;
  } catch (err) {
    await conn.query("ROLLBACK");
    throw err;
  } finally {
    conn.release();
  }
}
