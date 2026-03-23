import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// This is a helper for local development v.s. production on Cloudflare
// In Cloudflare Workers/Pages context, we get the 'DB' binding.

export function getDb(context?: any) {
  // Try to find D1 binding from context or process.env (Next.js on Pages provides it)
  // For Next.js on Pages, we often use getRequestContext()
  // But let's check for the existence of the D1 binding object.
  
  if (typeof process !== 'undefined' && (process.env as any).DB) {
    return drizzleD1((process.env as any).DB, { schema });
  }

  // Fallback to local sqlite for regular 'npm run dev' or migrations
  if (typeof window === 'undefined') {
    const sqlite = new Database('sqlite.db');
    sqlite.pragma('foreign_keys = ON');
    return drizzleBetterSqlite(sqlite, { schema });
  }
}

// Export a default instance for migration scripts/local tools
export const db = getDb()!;
