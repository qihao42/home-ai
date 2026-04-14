import type { DatabaseConnection } from './database.js'

const migrations: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS automations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    enabled INTEGER DEFAULT 1,
    config TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS state_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id TEXT NOT NULL,
    state TEXT NOT NULL,
    attributes TEXT NOT NULL,
    timestamp TEXT NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_history_entity_timestamp
    ON state_history(entity_id, timestamp)`,

  `CREATE TABLE IF NOT EXISTS scenes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    entities TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
  )`,
]

export function runMigrations(db: DatabaseConnection): void {
  for (const sql of migrations) {
    db.run(sql)
  }
}
