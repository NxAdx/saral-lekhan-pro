// SQLite schema for notes and tags
export const createSchema = `
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  body TEXT,
  tag TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  pinned INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE
);
`;