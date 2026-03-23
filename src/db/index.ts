import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// For local MVP, use a sqlite file in the project root.
const dbPath = path.join(process.cwd(), 'sqlite.db');
const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, { schema });
