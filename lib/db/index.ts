import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const isServer = typeof window === 'undefined';

if (isServer && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const db = isServer 
  ? drizzle(neon(process.env.DATABASE_URL!), { schema })
  : (null as any);
