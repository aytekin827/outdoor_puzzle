import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db',
  },
  // To use D1 with Drizzle Kit, we can use the following for wrangler integration
  // or just run migrations locally and push the sqlite.db if needed.
  // But the standard way to push to REMOTE D1 is:
  // npx drizzle-kit push --config drizzle.config.ts
});
