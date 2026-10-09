import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { allowRoles, authPool, jwtSecret, requireAuth, type AppRole } from '../middleware/auth.js';

const router = Router();
const roles: AppRole[] = ['engineer', 'subsidiary_head', 'executive', 'auditor'];
let schemaReady: Promise<void> | undefined;
const ensureAuthSchema = () => {
  schemaReady ??= (async () => {
    await authPool.query(`CREATE TABLE IF NOT EXISTS esg_entities (
      id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, level TEXT NOT NULL CHECK (level IN ('group','subsidiary','site')),
      parent_id BIGINT REFERENCES esg_entities(id), region TEXT NOT NULL DEFAULT '', UNIQUE (name,parent_id)
    )`);
    await authPool.query(`CREATE TABLE IF NOT EXISTS esg_users (
      id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('engineer','subsidiary_head','executive','auditor')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await authPool.query(`CREATE TABLE IF NOT EXISTS esg_user_scopes (
      user_id BIGINT NOT NULL REFERENCES esg_users(id) ON DELETE CASCADE,
      entity_id BIGINT NOT NULL REFERENCES esg_entities(id) ON DELETE CASCADE,
      PRIMARY KEY(user_id,entity_id)
    )`);
    await authPool.query(`CREATE TABLE IF NOT EXISTS esg_signup_requests (
      id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('engineer')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      reviewed_by BIGINT REFERENCES esg_users(id), review_note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), reviewed_at TIMESTAMPTZ
    )`);
    await authPool.query(`CREATE UNIQUE INDEX IF NOT EXISTS esg_signup_pending_email_uq ON esg_signup_requests(email) WHERE status='pending'`);
    await authPool.query(`CREATE TABLE IF NOT EXISTS esg_signup_scopes (
      request_id BIGINT NOT NULL REFERENCES esg_signup_requests(id) ON DELETE CASCADE,
      entity_id BIGINT NOT NULL REFERENCES esg_entities(id), PRIMARY KEY(request_id,entity_id)
    )`);
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (email && password) {
      const passwordHash = await hash(password, 12);
      await authPool.query("INSERT INTO esg_users(email,name,password_hash,role) VALUES($1,'Portal Administrator',$2,'executive') ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,role='executive'", [email, passwordHash]);
    }
  })().catch((error) => { schemaReady = undefined; throw error; });
  return schemaReady;
};

const issueToken = (user: { id: number; email: string; name: string; role: AppRole }) => jwt.sign(user, jwtSecret(), { expiresIn: '8h' });

router.post('/login', async (req, res, next) => {
  try {
    await ensureAuthSchema();
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) return res.status(503).json({ message: 'Set JWT_SECRET to at least 32 characters in the server environment.' });
    const configuredUsers = await authPool.query('SELECT COUNT(*)::int AS count FROM esg_users');
    if (configuredUsers.rows[0].count === 0) return res.status(503).json({ message: 'Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to create the CSO / Super Admin account.' });
    const body = z.object({ email: z.string().email(), password: z.string().min(1), role: z.enum(roles as [AppRole, ...AppRole[]]) }).safeParse(req.body);
    if (!body.success) return res.status(400).json({ message: 'Choose a role and enter a valid email and password.' });
    const email = body.data.email.trim().toLowerCase();
    if (body.data.role === 'executive') {
      const envEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase() ?? '';
      const envPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? '';
      const configuredPassword = Buffer.from(envPassword);
      const submittedPassword = Buffer.from(body.data.password);
      const passwordMatches = configuredPassword.length === submittedPassword.length && timingSafeEqual(configuredPassword, submittedPassword);
      if (!envEmail || email !== envEmail || !passwordMatches) return res.status(401).json({ message: 'CSO credentials do not match the server environment.' });
    }
    const { rows } = await authPool.query('SELECT id,email,name,password_hash AS "passwordHash",role FROM esg_users WHERE email=$1', [email]);
    if (!rows.length || rows[0].role !== body.data.role || !(await compare(body.data.password, rows[0].passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect for the selected role.' });
    const user = { id: Number(rows[0].id), email: rows[0].email, name: rows[0].name, role: rows[0].role as AppRole };
    res.json({ data: { user, token: issueToken(user) } });
  } catch (error) { next(error); }
});

router.get('/public/sites', async (_req, res, next) => {
  try {
    await ensureAuthSchema();
    const { rows } = await authPool.query(`SELECT id,name,region FROM esg_entities WHERE level='site' ORDER BY name`);
    res.json({ data: rows.map((row) => ({ id: Number(row.id), name: row.name, region: row.region })) });
  } catch (error) { next(error); }
});

router.post('/signup', async (req, res, next) => {
  const parsed = z.object({
    name: z.string().trim().min(1).max(120), email: z.string().email(), password: z.string().min(12),
    role: z.literal('engineer'), siteIds: z.array(z.number().int().positive()).length(1),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Enter your details, a password of at least 12 characters, and at least one site.' });
  try {
    await ensureAuthSchema();
    const { name,email,password,role,siteIds } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await authPool.query('SELECT 1 FROM esg_users WHERE email=$1', [normalizedEmail]);
    if (existingUser.rowCount) return res.status(409).json({ message: 'An account already exists for that email.' });
    const validSites = await authPool.query("SELECT id FROM esg_entities WHERE id=ANY($1::bigint[]) AND level='site'", [siteIds]);
    if (validSites.rowCount !== new Set(siteIds).size) return res.status(400).json({ message: 'Choose valid sites from the site list.' });
    const client = await authPool.connect();
    try {
      await client.query('BEGIN');
      const request = await client.query(`INSERT INTO esg_signup_requests(email,name,password_hash,role)
        VALUES($1,$2,$3,$4) RETURNING id`, [normalizedEmail,name,await hash(password,12),role]);
      for (const siteId of new Set(siteIds)) await client.query('INSERT INTO esg_signup_scopes(request_id,entity_id) VALUES($1,$2)', [request.rows[0].id,siteId]);
      await client.query('COMMIT');
      res.status(201).json({ message: 'Your sign-up request was sent for approval.' });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      if (typeof error === 'object' && error && 'code' in error && error.code === '23505') return res.status(409).json({ message: 'A request for that email is already waiting for approval.' });
      throw error;
    } finally { client.release(); }
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (req, res) => res.json({ data: req.user }));

router.get('/requests', requireAuth, async (req, res, next) => {
  if (req.user!.role !== 'subsidiary_head') return res.status(403).json({ message: 'Only a Subsidiary Head can review Site Engineer sign-up requests.' });
  try {
    await ensureAuthSchema();
    const roleFilter = 'engineer';
    const { rows } = await authPool.query(`SELECT r.id,r.name,r.email,r.role,r.created_at AS "createdAt",
      COALESCE(json_agg(json_build_object('id',e.id,'name',e.name,'region',e.region)) FILTER (WHERE e.id IS NOT NULL),'[]') AS sites
      FROM esg_signup_requests r LEFT JOIN esg_signup_scopes s ON s.request_id=r.id LEFT JOIN esg_entities e ON e.id=s.entity_id
      WHERE r.status='pending' AND r.role=$1 GROUP BY r.id ORDER BY r.created_at`, [roleFilter]);
    const { accessibleSiteIds } = await import('../middleware/auth.js');
    const visibleIds = await accessibleSiteIds(req.user!);
    res.json({ data: rows.filter((request) => request.sites.every((site: { id: number }) => visibleIds?.includes(Number(site.id)))) });
  } catch (error) { next(error); }
});

router.patch('/requests/:id', requireAuth, async (req, res, next) => {
  const parsed = z.object({ decision: z.enum(['approve','reject']), note: z.string().trim().max(1000).optional().default('') }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Choose approve or reject.' });
  try {
    await ensureAuthSchema();
    const client = await authPool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(`SELECT id,email,name,password_hash AS "passwordHash",role,status
        FROM esg_signup_requests WHERE id=$1 FOR UPDATE`, [req.params.id]);
      if (!rows.length || rows[0].status !== 'pending') { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Pending request not found.' }); }
      const request = rows[0];
      if (req.user!.role !== 'subsidiary_head' || request.role !== 'engineer') { await client.query('ROLLBACK'); return res.status(403).json({ message: 'Only a Subsidiary Head can review Site Engineer requests.' }); }
      if (parsed.data.decision === 'approve') {
        const scopes = await client.query('SELECT entity_id FROM esg_signup_scopes WHERE request_id=$1', [request.id]);
        if (request.role === 'engineer') {
          const { accessibleSiteIds } = await import('../middleware/auth.js');
          const allowedSites = await accessibleSiteIds(req.user!);
          if (scopes.rows.some((scope) => !allowedSites?.includes(Number(scope.entity_id)))) { await client.query('ROLLBACK'); return res.status(403).json({ message: 'This request is for a site outside your assigned subsidiary scope.' }); }
        }
        const inserted = await client.query('INSERT INTO esg_users(email,name,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id', [request.email,request.name,request.passwordHash,request.role]);
        for (const scope of scopes.rows) await client.query('INSERT INTO esg_user_scopes(user_id,entity_id) VALUES($1,$2)', [inserted.rows[0].id,scope.entity_id]);
      }
      await client.query(`UPDATE esg_signup_requests SET status=$1,reviewed_by=$2,review_note=$3,reviewed_at=NOW() WHERE id=$4`, [parsed.data.decision === 'approve' ? 'approved' : 'rejected',req.user!.id,parsed.data.note,request.id]);
      await client.query('COMMIT');
      res.json({ message: `Sign-up request ${parsed.data.decision}d.` });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      if (typeof error === 'object' && error && 'code' in error && error.code === '23505') return res.status(409).json({ message: 'An account already exists for this email.' });
      throw error;
    } finally { client.release(); }
  } catch (error) { next(error); }
});

router.post('/users', requireAuth, allowRoles('executive'), async (req, res, next) => {
  const parsed = z.object({ email: z.string().email(), name: z.string().trim().min(1).max(120), password: z.string().min(12), role: z.enum(['subsidiary_head','auditor']), entityIds: z.array(z.number().int().positive()).default([]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Check the user details. Passwords must be at least 12 characters.' });
  const client = await authPool.connect();
  try {
    await ensureAuthSchema();
    const { email, name, password, role, entityIds } = parsed.data;
    if (role === 'subsidiary_head' && entityIds.length === 0) return res.status(400).json({ message: 'Assign at least one subsidiary scope to this account.' });
    const allowedLevel = 'subsidiary';
    if (entityIds.length) {
      const { rows } = await client.query('SELECT COUNT(*)::int AS count FROM esg_entities WHERE id=ANY($1::bigint[]) AND level=$2', [entityIds, allowedLevel]);
      if (rows[0].count !== new Set(entityIds).size) return res.status(400).json({ message: `Choose valid ${allowedLevel} scopes for this role.` });
    }
    await client.query('BEGIN');
    const inserted = await client.query('INSERT INTO esg_users(email,name,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,email,name,role', [email.trim().toLowerCase(), name, await hash(password, 12), role]);
    for (const entityId of entityIds) await client.query('INSERT INTO esg_user_scopes(user_id,entity_id) VALUES($1,$2)', [inserted.rows[0].id, entityId]);
    await client.query('COMMIT');
    res.status(201).json({ data: inserted.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') return res.status(409).json({ message: 'An account already exists for that email.' });
    next(error);
  }
  finally { client.release(); }
});

export default router;
