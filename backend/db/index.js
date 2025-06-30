import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

config({ path: '.env' });

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/mise_cooking';

// Create postgres connection
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Test database connection
export const testConnection = async () => {
  try {
    await client`SELECT 1`;
    console.log('📦 PostgreSQL Connected successfully');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    return false;
  }
};

export default db; 