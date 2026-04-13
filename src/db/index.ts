import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DATABASE_URL can be set to an absolute path for production environments
// (e.g. a mounted Azure Files path). Falls back to <project-root>/messenger.db.
const dbPath = process.env.DATABASE_URL ?? path.join(__dirname, '../../messenger.db');
const sqlite = new Database(dbPath);

// WAL mode for better concurrent read performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
