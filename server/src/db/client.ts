import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

const rawUrl = process.env['DATABASE_URL'] || '';
const cleanUrl = rawUrl
  .replace('&channel_binding=require', '')
  .replace('channel_binding=require&', '')
  .replace('?channel_binding=require', '');

export const db = postgres<Contract>({
  contractJson,
  url: cleanUrl || rawUrl,
  poolOptions: {
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 60000,
  },
});

