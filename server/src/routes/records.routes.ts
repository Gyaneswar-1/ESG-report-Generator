import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Router, type RequestHandler } from 'express';
import { Pool } from 'pg';
import multer from 'multer';
import { z } from 'zod';
import { accessibleSiteIds, allowRoles, requireAuth } from '../middleware/auth.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, cb) => cb(null, file.mimetype === 'application/pdf') });
const uploadPdf: RequestHandler = (req, res, next) => upload.single('evidence')(req, res, (error) => {
  if (error) return res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid evidence file.' });
  next();
});
const recordSchema = z.object({
  siteId: z.coerce.number().int().positive(),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  metricCode: z.enum(['diesel', 'electricity', 'water', 'total_waste', 'recycled_waste', 'lost_time_injuries', 'working_hours', 'other']),
  metric: z.string().trim().min(1).max(160),
  rawValue: z.coerce.number().finite().nonnegative(),
  rawUnit: z.string().trim().min(1).max(40),
  notes: z.string().trim().max(2000).optional().default(''),
});
const siteSchema = z.object({ group: z.string().trim().min(1).max(120), subsidiary: z.string().trim().min(1).max(120), site: z.string().trim().min(1).max(120), region: z.string().trim().min(1).max(100) });

let tableReady: Promise<void> | undefined;
const ensureTables = () => {
  tableReady ??= (async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS esg_entities (
      id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, level TEXT NOT NULL CHECK (level IN ('group','subsidiary','site')),
      parent_id BIGINT REFERENCES esg_entities(id), region TEXT NOT NULL DEFAULT '',
      UNIQUE (name, parent_id)
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS esg_evidence (
      id BIGSERIAL PRIMARY KEY, sha256 CHAR(64) NOT NULL UNIQUE, file_name TEXT NOT NULL,
      storage_path TEXT NOT NULL, mime_type TEXT NOT NULL, byte_size BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS esg_records (
      id BIGSERIAL PRIMARY KEY, site TEXT NOT NULL, period CHAR(7) NOT NULL,
      pillar TEXT NOT NULL CHECK (pillar IN ('environmental','social','governance')),
      metric TEXT NOT NULL, value NUMERIC NOT NULL CHECK (value >= 0), unit TEXT NOT NULL,
      entered_by TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('engineer','subsidiary_head','executive','auditor')),
      evidence TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query(`ALTER TABLE esg_records
      ADD COLUMN IF NOT EXISTS site_id BIGINT REFERENCES esg_entities(id),
      ADD COLUMN IF NOT EXISTS metric_code TEXT,
      ADD COLUMN IF NOT EXISTS raw_value NUMERIC,
      ADD COLUMN IF NOT EXISTS raw_unit TEXT,
      ADD COLUMN IF NOT EXISTS formula TEXT,
      ADD COLUMN IF NOT EXISTS evidence_id BIGINT REFERENCES esg_evidence(id),
      ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
      ADD COLUMN IF NOT EXISTS review_note TEXT,
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`);
    await pool.query('CREATE INDEX IF NOT EXISTS esg_records_site_period_idx ON esg_records(site_id, period)');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS esg_records_site_period_metric_uq ON esg_records(site_id,period,metric_code) WHERE site_id IS NOT NULL AND metric_code IS NOT NULL');
    await pool.query(`CREATE TABLE IF NOT EXISTS esg_record_audit (
      id BIGSERIAL PRIMARY KEY, record_id BIGINT NOT NULL REFERENCES esg_records(id), action TEXT NOT NULL,
      raw_value NUMERIC NOT NULL, raw_unit TEXT NOT NULL, normalized_value NUMERIC NOT NULL,
      normalized_unit TEXT NOT NULL, formula TEXT, entered_by TEXT NOT NULL, role TEXT NOT NULL,
      evidence_id BIGINT NOT NULL REFERENCES esg_evidence(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  })().catch((error) => { tableReady = undefined; throw error; });
  return tableReady;
};

router.use(requireAuth);

router.get('/sites', async (_req, res, next) => {
  try {
    await ensureTables();
    const visible = await accessibleSiteIds(_req.user!);
    const { rows } = await pool.query(`SELECT s.id, s.name, s.region, sub.name AS subsidiary, sub.id AS "subsidiaryId", grp.name AS "group"
      FROM esg_entities s JOIN esg_entities sub ON sub.id=s.parent_id JOIN esg_entities grp ON grp.id=sub.parent_id
      WHERE s.level='site' AND ($1::bigint[] IS NULL OR s.id=ANY($1)) ORDER BY grp.name, sub.name, s.name`, [visible]);
    res.json({ data: rows.map((row) => ({ ...row, id: Number(row.id), subsidiaryId: Number(row.subsidiaryId) })) });
  } catch (error) { next(error); }
});

router.post('/sites', allowRoles('executive'), async (req, res, next) => {
  const parsed = siteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Enter a group, subsidiary, site and region.' });
  const client = await pool.connect();
  try {
    await ensureTables();
    const { group, subsidiary, site, region } = parsed.data;
    await client.query('BEGIN');
    let result = await client.query("SELECT id FROM esg_entities WHERE name=$1 AND level='group' AND parent_id IS NULL", [group]);
    if (!result.rowCount) result = await client.query("INSERT INTO esg_entities(name,level,parent_id) VALUES($1,'group',NULL) RETURNING id", [group]);
    const groupId = result.rows[0].id;
    result = await client.query("INSERT INTO esg_entities(name,level,parent_id) VALUES($1,'subsidiary',$2) ON CONFLICT(name,parent_id) DO UPDATE SET name=EXCLUDED.name RETURNING id", [subsidiary, groupId]);
    const subsidiaryId = result.rows[0].id;
    result = await client.query("INSERT INTO esg_entities(name,level,parent_id,region) VALUES($1,'site',$2,$3) ON CONFLICT(name,parent_id) DO UPDATE SET region=EXCLUDED.region RETURNING id,name,region", [site, subsidiaryId, region]);
    await client.query('COMMIT');
    res.status(201).json({ data: { ...result.rows[0], id: Number(result.rows[0].id) } });
  } catch (error) { await client.query('ROLLBACK'); next(error); }
  finally { client.release(); }
});

router.get('/records', async (req, res, next) => {
  try {
    await ensureTables();
    const visible = await accessibleSiteIds(req.user!);
    const { rows } = await pool.query(`SELECT r.id, r.site_id AS "siteId", r.site, r.period, r.pillar, r.metric, r.metric_code AS "metricCode",
      r.value::float8 AS value, r.unit, r.raw_value::float8 AS "rawValue", r.raw_unit AS "rawUnit", r.formula,
      r.entered_by AS "enteredBy", r.role, r.notes, r.evidence_id AS "evidenceId", e.sha256 AS "evidenceHash", e.file_name AS "evidenceName", r.created_at AS "createdAt",
      r.review_status AS "reviewStatus",r.reviewed_by AS "reviewedBy",r.review_note AS "reviewNote",r.reviewed_at AS "reviewedAt"
      FROM esg_records r LEFT JOIN esg_evidence e ON e.id=r.evidence_id
      WHERE ($1::bigint[] IS NULL OR r.site_id=ANY($1)) AND ($2::bigint IS NULL OR r.site_id=$2)
      ORDER BY r.created_at DESC LIMIT 200`, [visible, req.query.siteId ? Number(req.query.siteId) : null]);
    res.json({ data: rows });
  } catch (error) { next(error); }
});

router.get('/records/:id/audit', async (req, res, next) => {
  try {
    await ensureTables();
    const visible = await accessibleSiteIds(req.user!);
    const access = await pool.query('SELECT site_id FROM esg_records WHERE id=$1', [req.params.id]);
    if (!access.rowCount || (visible !== null && !visible.includes(Number(access.rows[0].site_id)))) return res.status(404).json({ message: 'Record not found.' });
    const { rows } = await pool.query(`SELECT a.id,a.action,a.raw_value::float8 AS "rawValue",a.raw_unit AS "rawUnit",
      a.normalized_value::float8 AS "normalizedValue",a.normalized_unit AS "normalizedUnit",a.formula,
      a.entered_by AS "enteredBy",a.role,a.created_at AS "createdAt",e.id AS "evidenceId",e.sha256 AS "evidenceHash",e.file_name AS "evidenceName"
      FROM esg_record_audit a JOIN esg_evidence e ON e.id=a.evidence_id WHERE a.record_id=$1 ORDER BY a.created_at DESC`, [req.params.id]);
    res.json({ data: rows });
  } catch (error) { next(error); }
});

router.patch('/records/:id/review', allowRoles('subsidiary_head'), async (req, res, next) => {
  const body = z.object({ status: z.enum(['approved','rejected']), note: z.string().trim().max(1000).optional().default('') }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: 'Choose approve or reject.' });
  try {
    await ensureTables();
    const siteIds = await accessibleSiteIds(req.user!);
    const { rows } = await pool.query(`UPDATE esg_records SET review_status=$1,reviewed_by=$2,review_note=$3,reviewed_at=NOW()
      WHERE id=$4 AND site_id=ANY($5::bigint[]) RETURNING id,raw_value::float8 AS raw_value,raw_unit,value::float8 AS value,unit,formula,evidence_id,entered_by,role`,
      [body.data.status, req.user!.name, body.data.note, req.params.id, siteIds ?? []]);
    if (!rows.length) return res.status(404).json({ message: 'Record was not found in your assigned subsidiary scope.' });
    const row = rows[0];
    await pool.query(`INSERT INTO esg_record_audit(record_id,action,raw_value,raw_unit,normalized_value,normalized_unit,formula,entered_by,role,evidence_id)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [row.id,body.data.status,row.raw_value,row.raw_unit,row.value,row.unit,row.formula,req.user!.name,req.user!.role,row.evidence_id]);
    res.json({ data: { id: row.id, reviewStatus: body.data.status } });
  } catch (error) { next(error); }
});

router.get('/metrics', allowRoles('executive'), async (req, res, next) => {
  try {
    await ensureTables();
    const region = typeof req.query.region === 'string' ? req.query.region : null;
    const { rows } = await pool.query(`SELECT r.metric_code AS "metricCode", r.metric, r.unit, SUM(r.value)::float8 AS total,
      COUNT(DISTINCT r.site_id)::int AS "siteCount", r.period
      FROM esg_records r JOIN esg_entities s ON s.id=r.site_id
      WHERE ($1::text IS NULL OR LOWER(s.region)=LOWER($1))
      GROUP BY r.metric_code,r.metric,r.unit,r.period ORDER BY r.period DESC,r.metric`, [region]);
    res.json({ data: rows });
  } catch (error) { next(error); }
});

router.post('/records', allowRoles('engineer'), uploadPdf, async (req, res, next) => {
  const parsed = recordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Please check the required fields.', errors: parsed.error.flatten().fieldErrors });
  if (!req.file) return res.status(400).json({ message: 'Attach a PDF evidence file before saving this measurement.' });
  if (req.file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') return res.status(400).json({ message: 'The evidence file is not a valid PDF.' });
  const client = await pool.connect();
  let storedFile: string | undefined;
  try {
    await ensureTables();
    const record = parsed.data;
    const permittedUnits: Record<string, string[]> = {
      diesel: ['liter', 'liters', 'l'], electricity: ['kwh', 'mwh', 'megawatt-hours'],
      water: ['liter', 'liters', 'l', 'kl', 'm3', 'm³'],
      total_waste: ['kg', 'kilograms', 't', 'tonne', 'tonnes', 'metric tons'],
      recycled_waste: ['kg', 'kilograms', 't', 'tonne', 'tonnes', 'metric tons'],
      lost_time_injuries: ['incident', 'incidents', 'count'], working_hours: ['hour', 'hours', 'hr'],
    };
    const units = permittedUnits[record.metricCode];
    if (units && !units.includes(record.rawUnit.toLowerCase())) {
      return res.status(400).json({ message: `Choose a supported unit for ${record.metric}.` });
    }
    const siteIds = await accessibleSiteIds(req.user!);
    const siteResult = await client.query("SELECT id,name,region FROM esg_entities WHERE id=$1 AND level='site' AND ($2::bigint[] IS NULL OR id=ANY($2))", [record.siteId,siteIds]);
    if (!siteResult.rowCount) return res.status(403).json({ message: 'Choose a site assigned to your account. Measurements can only be entered at site level.' });

    const rawUnit = record.rawUnit.trim().toLowerCase();
    let normalizedValue = record.rawValue;
    let normalizedUnit = record.rawUnit;
    let formula: string | null = null;
    if (record.metricCode === 'diesel' && ['liter', 'liters', 'l'].includes(rawUnit)) {
      normalizedValue = (record.rawValue * 2.68) / 1000;
      normalizedUnit = 'MT CO2e';
      formula = 'MT CO2e = (liters × 2.68) ÷ 1000';
    } else if (record.metricCode === 'electricity' && ['mwh', 'megawatt-hours'].includes(rawUnit)) {
      normalizedValue = record.rawValue * 1000;
      normalizedUnit = 'kWh';
      formula = 'kWh = MWh × 1,000';
    } else if (record.metricCode === 'water' && ['liter', 'liters', 'l'].includes(rawUnit)) {
      normalizedValue = record.rawValue / 1000;
      normalizedUnit = 'kL';
      formula = 'kL = liters ÷ 1,000';
    } else if (record.metricCode === 'water' && ['m3', 'm³'].includes(rawUnit)) {
      normalizedUnit = 'kL';
      formula = '1 m³ = 1 kL';
    } else if (['total_waste', 'recycled_waste'].includes(record.metricCode) && ['kg', 'kilograms'].includes(rawUnit)) {
      normalizedValue = record.rawValue / 1000;
      normalizedUnit = 't';
      formula = 't = kg ÷ 1,000';
    } else if (['total_waste', 'recycled_waste'].includes(record.metricCode) && ['tonne', 'tonnes', 'metric tons'].includes(rawUnit)) {
      normalizedUnit = 't';
      formula = '1 metric tonne = 1 t';
    }
    if (record.metricCode === 'recycled_waste' || record.metricCode === 'total_waste') {
      const pairCode = record.metricCode === 'recycled_waste' ? 'total_waste' : 'recycled_waste';
      const pair = await client.query('SELECT value FROM esg_records WHERE site_id=$1 AND period=$2 AND metric_code=$3 ORDER BY created_at DESC LIMIT 1', [record.siteId, record.period, pairCode]);
      const total = record.metricCode === 'total_waste' ? normalizedValue : Number(pair.rows[0]?.value ?? 0);
      const recycled = record.metricCode === 'recycled_waste' ? normalizedValue : Number(pair.rows[0]?.value ?? 0);
      if (recycled > total) return res.status(400).json({ message: 'Recycled waste cannot exceed total waste generated for this site and month.' });
    }
    if (record.metricCode === 'lost_time_injuries' || record.metricCode === 'working_hours') {
      const pairCode = record.metricCode === 'lost_time_injuries' ? 'working_hours' : 'lost_time_injuries';
      const pair = await client.query('SELECT value FROM esg_records WHERE site_id=$1 AND period=$2 AND metric_code=$3 ORDER BY created_at DESC LIMIT 1', [record.siteId, record.period, pairCode]);
      const incidents = record.metricCode === 'lost_time_injuries' ? record.rawValue : Number(pair.rows[0]?.value ?? 0);
      const hours = record.metricCode === 'working_hours' ? record.rawValue : Number(pair.rows[0]?.value ?? 0);
      if (incidents > 0 && hours === 0) return res.status(400).json({ message: 'Enter total working hours before reporting lost-time injuries.' });
    }

    const sha256 = createHash('sha256').update(req.file.buffer).digest('hex');
    const evidenceDir = resolve(process.env.ESG_UPLOAD_DIR ?? join(process.cwd(), 'uploads', 'evidence'));
    await mkdir(evidenceDir, { recursive: true });
    storedFile = join(evidenceDir, `${sha256}.pdf`);
    await writeFile(storedFile, req.file.buffer, { flag: 'wx' }).catch(async (error: NodeJS.ErrnoException) => { if (error.code !== 'EEXIST') throw error; });
    await client.query('BEGIN');
    const evidenceResult = await client.query(`INSERT INTO esg_evidence(sha256,file_name,storage_path,mime_type,byte_size)
      VALUES($1,$2,$3,'application/pdf',$4) ON CONFLICT(sha256) DO UPDATE SET sha256=EXCLUDED.sha256 RETURNING id`, [sha256, req.file.originalname.slice(0, 250), storedFile, req.file.size]);
    const { name: siteName } = siteResult.rows[0];
    const pillar = ['diesel','electricity','water','total_waste','recycled_waste'].includes(record.metricCode) ? 'environmental' : ['lost_time_injuries','working_hours'].includes(record.metricCode) ? 'social' : 'governance';
    const { rows } = await client.query(`INSERT INTO esg_records(site,period,pillar,metric,value,unit,entered_by,role,evidence,notes,site_id,metric_code,raw_value,raw_unit,formula,evidence_id)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      ON CONFLICT (site_id,period,metric_code) WHERE site_id IS NOT NULL AND metric_code IS NOT NULL
      DO UPDATE SET site=EXCLUDED.site,pillar=EXCLUDED.pillar,metric=EXCLUDED.metric,value=EXCLUDED.value,unit=EXCLUDED.unit,
        entered_by=EXCLUDED.entered_by,role=EXCLUDED.role,evidence=EXCLUDED.evidence,notes=EXCLUDED.notes,
        raw_value=EXCLUDED.raw_value,raw_unit=EXCLUDED.raw_unit,formula=EXCLUDED.formula,evidence_id=EXCLUDED.evidence_id,
        review_status='pending',reviewed_by=NULL,review_note=NULL,reviewed_at=NULL,created_at=NOW()
      RETURNING id,site,period,pillar,metric,metric_code AS "metricCode",value::float8 AS value,unit,raw_value::float8 AS "rawValue",raw_unit AS "rawUnit",formula,entered_by AS "enteredBy",role,notes,evidence_id AS "evidenceId",created_at AS "createdAt"`,
      [siteName,record.period,pillar,record.metric,normalizedValue,normalizedUnit,req.user!.name,req.user!.role,req.file.originalname,record.notes,record.siteId,record.metricCode,record.rawValue,record.rawUnit,formula,evidenceResult.rows[0].id]);
    await client.query(`INSERT INTO esg_record_audit(record_id,action,raw_value,raw_unit,normalized_value,normalized_unit,formula,entered_by,role,evidence_id)
      VALUES($1,'saved', $2,$3,$4,$5,$6,$7,$8,$9)`, [rows[0].id,record.rawValue,record.rawUnit,normalizedValue,normalizedUnit,formula,req.user!.name,req.user!.role,evidenceResult.rows[0].id]);
    await client.query('COMMIT');
    res.status(201).json({ data: { ...rows[0], evidenceHash: sha256, evidenceName: req.file.originalname } });
  } catch (error) { await client.query('ROLLBACK').catch(() => undefined); next(error); }
  finally { client.release(); }
});

router.get('/evidence/:id', async (req, res, next) => {
  try {
    await ensureTables();
    const visible = await accessibleSiteIds(req.user!);
    const { rows } = await pool.query(`SELECT e.storage_path,e.file_name,e.sha256 FROM esg_evidence e
      JOIN esg_records r ON r.evidence_id=e.id WHERE e.id=$1 AND ($2::bigint[] IS NULL OR r.site_id=ANY($2)) LIMIT 1`, [req.params.id,visible]);
    if (!rows.length) return res.status(404).json({ message: 'Evidence file not found.' });
    res.type('application/pdf').setHeader('Content-Disposition', `inline; filename="${String(rows[0].file_name).replace(/["\\\r\n]/g, '_')}"`).setHeader('X-Content-SHA256', rows[0].sha256).sendFile(rows[0].storage_path);
  } catch (error) { next(error); }
});

export default router;
