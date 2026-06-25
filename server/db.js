import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'work-notes.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS work_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_work_entries_date ON work_entries(date);
`);

export function getEntryByDate(date) {
  return db.prepare('SELECT * FROM work_entries WHERE date = ?').get(date);
}

export function getEntriesByRange(start, end) {
  return db
    .prepare('SELECT * FROM work_entries WHERE date >= ? AND date <= ? ORDER BY date ASC')
    .all(start, end);
}

export function upsertEntry(date, content) {
  const existing = getEntryByDate(date);
  if (existing) {
    db.prepare(
      "UPDATE work_entries SET content = ?, updated_at = datetime('now') WHERE date = ?"
    ).run(content, date);
    return getEntryByDate(date);
  }
  db.prepare('INSERT INTO work_entries (date, content) VALUES (?, ?)').run(date, content);
  return getEntryByDate(date);
}

export function deleteEntry(date) {
  return db.prepare('DELETE FROM work_entries WHERE date = ?').run(date);
}
