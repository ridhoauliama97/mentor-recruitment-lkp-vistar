import { execSql } from "./database.js";

const TABLES = [
  `CREATE TABLE IF NOT EXISTS criteria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK(type IN ('benefit', 'cost')),
    unit VARCHAR(100),
    weight_ref INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    education VARCHAR(10) CHECK(education IN ('SMA', 'D3', 'S1', 'S2', 'S3')),
    major TEXT,
    expertise TEXT,
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS sub_criteria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    criteria_id INT NOT NULL,
    name TEXT NOT NULL,
    weight INT NOT NULL CHECK(weight >= 1 AND weight <= 5),
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criteria_id) REFERENCES criteria(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    criteria_id INT NOT NULL,
    value DOUBLE NOT NULL,
    sub_criteria_id INT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, criteria_id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (criteria_id) REFERENCES criteria(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_criteria_id) REFERENCES sub_criteria(id)
  )`,

  `CREATE TABLE IF NOT EXISTS psi_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    calculated_at DATETIME
  )`,

  `CREATE TABLE IF NOT EXISTS psi_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    candidate_id INT NOT NULL,
    psi_score DOUBLE NOT NULL,
    \`rank\` INT NOT NULL,
    is_recommended BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES psi_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS app_settings (
    \`key\` VARCHAR(255) PRIMARY KEY,
    \`value\` TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS psi_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    candidate_id INT NOT NULL,
    criteria_id INT NOT NULL,
    raw_value DOUBLE NOT NULL,
    normalized_value DOUBLE NOT NULL,
    pv_contribution DOUBLE,
    dpv_contribution DOUBLE,
    phi_value DOUBLE,
    weighted_score DOUBLE,
    FOREIGN KEY (session_id) REFERENCES psi_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    FOREIGN KEY (criteria_id) REFERENCES criteria(id)
  )`,
];

export async function runSchema() {
  for (const sql of TABLES) {
    await execSql(sql);
  }
}
