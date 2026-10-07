import { configDotenv } from 'dotenv';
import { z } from 'zod';

configDotenv();

export const envConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string(),
  CORS_ORIGIN: z.string(),
});

const envParsed = envConfigSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('Invalid environment variables:', envParsed.error.format());
  process.exit(1);
}

export const ENV = envParsed.data;
