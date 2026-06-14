import { execSql, run } from "./database.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('benefit', 'cost')),
  unit TEXT,
  weight_ref INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  education TEXT,
  institution TEXT,
  expertise TEXT,
  bio TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sub_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criteria_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight INTEGER NOT NULL CHECK(weight >= 1 AND weight <= 5),
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  criteria_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
  value REAL NOT NULL,
  sub_criteria_id INTEGER REFERENCES sub_criteria(id),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(candidate_id, criteria_id)
);

CREATE TABLE IF NOT EXISTS psi_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  calculated_at DATETIME
);

CREATE TABLE IF NOT EXISTS psi_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES psi_sessions(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id),
  psi_score REAL NOT NULL,
  rank INTEGER NOT NULL,
  is_recommended BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS psi_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES psi_sessions(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id),
  criteria_id INTEGER NOT NULL REFERENCES criteria(id),
  raw_value REAL NOT NULL,
  normalized_value REAL NOT NULL,
  pv_contribution REAL,
  dpv_contribution REAL,
  phi_value REAL,
  weighted_score REAL
);
`;

export function runSchema() {
  execSql(SCHEMA);
  try { run("ALTER TABLE scores ADD COLUMN sub_criteria_id INTEGER REFERENCES sub_criteria(id)"); } catch {}
  try { run("ALTER TABLE criteria ADD COLUMN code TEXT"); } catch {}
  try { run("ALTER TABLE criteria ADD COLUMN weight_ref INTEGER DEFAULT 0"); } catch {}
  try { run("ALTER TABLE criteria ADD COLUMN status TEXT DEFAULT 'active'"); } catch {}
}
