import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/mise_cooking',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
  },
  verbose: true,
  strict: true,
}); 