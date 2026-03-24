import { drizzle as drizzleD1, type DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// This is a helper for local development v.s. production on Cloudflare
// In Cloudflare Workers/Pages context, we get the 'DB' binding.

export function getDb(context?: any) {
  let dbBinding: any = undefined;

  // 1. Try to find D1 binding from process.env
  if (typeof process !== 'undefined' && (process.env as any).DB) {
    dbBinding = (process.env as any).DB;
  }

  // 2. Try to find D1 binding via OpenNext Cloudflare Context
  if (!dbBinding) {
    try {
      const cfContext = getCloudflareContext();
      if (cfContext?.env?.DB) {
        dbBinding = cfContext.env.DB;
      }
    } catch (e) {
      // Ignored: outside cloudflare request scope
    }
  }

  if (dbBinding) {
    return drizzleD1(dbBinding, { schema });
  }

  // 3. Fallback to local sqlite for regular 'npm run dev' or migrations
  if (typeof window === 'undefined') {
    try {
      // Standard CommonJS require for Node.js fallback (hidden from bundler to avoid Windows EPERM / symlink issues)
      const Database = eval(`require('better-sqlite3')`);
      const { drizzle } = eval(`require('drizzle-orm/better-sqlite3')`);
      
      const sqlite = new Database('sqlite.db');
      sqlite.pragma('foreign_keys = ON');
      return drizzle(sqlite, { schema });
    } catch (e) {
      console.warn("Using D1 Database without local better-sqlite3 fallback (Expected in Edge)");
    }
  }
}

// Export as a Proxy to lazily resolve the Cloudflare D1 context inside request handlers,
// since getCloudflareContext() will fail if called at module-load/global time.
export const db = new Proxy({} as DrizzleD1Database<typeof schema>, {
  get(target, prop) {
    const database = getDb();
    if (!database) {
      throw new Error("D1 Database binding is missing! Ensure you are calling this within a request context.");
    }
    const value = (database as any)[prop];
    return typeof value === "function" ? value.bind(database) : value;
  }
});
