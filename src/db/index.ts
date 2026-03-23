import { drizzle as drizzleD1, type DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

// This is a helper for local development v.s. production on Cloudflare
// In Cloudflare Workers/Pages context, we get the 'DB' binding.

export function getDb(context?: any) {
  // Try to find D1 binding from context or process.env
  if (typeof process !== 'undefined' && (process.env as any).DB) {
    return drizzleD1((process.env as any).DB, { schema });
  }

  // Fallback to local sqlite for regular 'npm run dev' or migrations
  if (typeof window === 'undefined') {
    try {
      // Dynamic require to prevent Next.js Edge runtime from statically analyzing 'better-sqlite3' and 'fs'
      const sqliteModuleName = 'better-sqlite3';
      const drizzleModuleName = 'drizzle-orm/better-sqlite3';
      
      // @ts-ignore
      const Database = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__(sqliteModuleName) : require(sqliteModuleName);
      // @ts-ignore
      const { drizzle } = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__(drizzleModuleName) : require(drizzleModuleName);
      
      const sqlite = new Database('sqlite.db');
      sqlite.pragma('foreign_keys = ON');
      return drizzle(sqlite, { schema });
    } catch (e) {
      console.warn("Using D1 Database without local better-sqlite3 fallback (Expected in Edge)");
    }
  }
}

// Export a default instance typed as D1 to satisfy TypeScript
export const db = getDb() as unknown as DrizzleD1Database<typeof schema>;
