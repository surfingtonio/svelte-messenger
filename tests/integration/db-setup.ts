/**
 * Test setup for integration tests.
 * Creates the required SQLite schema in the temp test database.
 */
import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_URL;
if (!dbPath) throw new Error('DATABASE_URL must be set before importing this setup file');

const sqlite = new Database(dbPath);

// Create the users table matching src/db/schema.ts
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first TEXT NOT NULL,
    last TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    roles TEXT NOT NULL DEFAULT '["user"]',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

sqlite.close();
