import { Router } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const router = Router();
const recordSchema = z.object({
  site: z.string().trim().min(1).max(120),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  pillar: z.enum(['environmental', 'social', 'governance']),
  metric: z.string().trim().min(1).max(160),
  value: z.number().finite().nonnegative(),
  unit: z.string().trim().min(1).max(40),
  enteredBy: z.string().trim().min(1).max(120),
  role: z.enum(['engineer', 'hse', 'executive', 'auditor']),
  evidence: z.string().trim().max(500).optional().default(''),
  notes: z.string().trim().max(2000).optional().default(''),
});

let tableReady: Promise<void> | undefined;
const ensureTable = () => {
  tableReady ??= pool.query(`CREATE TABLE IF NOT EXISTS esg_records (
    id BIGSERIAL PRIMARY KEY,
    site TEXT NOT NULL,
    period CHAR(7) NOT NULL,
    pillar TEXT NOT NULL CHECK (pillar IN ('environmental', 'social', 'governance')),
    metric TEXT NOT NULL,
    value NUMERIC NOT NULL CHECK (value >= 0),
    unit TEXT NOT NULL,
    entered_by TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('engineer', 'hse', 'executive', 'auditor')),
    evidence TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`).then(() => undefined);
  return tableReady;
};

router.get('/records', async (_req, res, next) => {
  try {
    await ensureTable();
    const { rows } = await pool.query('SELECT id, site, period, pillar, metric, value::float8 AS value, unit, entered_by AS "enteredBy", role, evidence, notes, created_at AS "createdAt" FROM esg_records ORDER BY created_at DESC LIMIT 200');
    res.json({ data: rows });
  } catch (error) { next(error); }
});

router.post('/records', async (req, res, next) => {
  try {
    const parsed = recordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Please check the required fields.', errors: parsed.error.flatten().fieldErrors });
    await ensureTable();
    const record = parsed.data;
    const { rows } = await pool.query(
      `INSERT INTO esg_records (site, period, pillar, metric, value, unit, entered_by, role, evidence, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, site, period, pillar, metric, value::float8 AS value, unit, entered_by AS "enteredBy", role, evidence, notes, created_at AS "createdAt"`,
      [record.site, record.period, record.pillar, record.metric, record.value, record.unit, record.enteredBy, record.role, record.evidence, record.notes],
    );
    res.status(201).json({ data: rows[0] });
  } catch (error) { next(error); }
});

export default router;
