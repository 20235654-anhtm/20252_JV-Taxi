import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const connectionString = databaseUrl
  ? (databaseUrl.includes('?') ? `${databaseUrl}&pgbouncer=true` : `${databaseUrl}?pgbouncer=true`)
  : undefined;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
