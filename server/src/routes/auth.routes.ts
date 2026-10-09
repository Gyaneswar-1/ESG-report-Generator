import { Router } from 'express';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { allowRoles, authPool, jwtSecret, requireAuth, type AppRole } from '../middleware/auth.js';

const router = Router();
const roles: AppRole[] = ['engineer', 'hse', 'subsidiary_head', 'executive', 'auditor'];
let schemaReady: Promise<void> | undefined;
const ensureAuthSchema = () => {
  schemaReady ??= (async () => {
    await authPool.query(`CREATE TABLE IF NOT EXISTS esg_entities (
      id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, level TEXT NOT NULL CHECK (level IN ('group','subsidiary','site')),
      parent_id BIGINT REFERENCES esg_entities(id), region TEXT NOT NULL DEFAULT '', UNIQUE (name,parent_id)
    )`);
    await authPool.query(`CREATE TABLE IF NOT EXISTS esg_users (
      id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('engineer','hse','subsidiary_head','executive','auditor')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await authPool.query(`CREATE TABLE IF NOT EXISTS esg_user_scopes (
      user_id BIGINT NOT NULL REFERENCES esg_users(id) ON DELETE CASCADE,
      entity_id BIGINT NOT NULL REFERENCES esg_entities(id) ON DELETE CASCADE,
      PRIMARY KEY(user_id,entity_id)
    )`);
    const count = await authPool.query('SELECT COUNT(*)::int AS count FROM esg_users');
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (count.rows[0].count === 0 && email && password) {
      const passwordHash = await hash(password, 12);
      await authPool.query("INSERT INTO esg_users(email,name,password_hash,role) VALUES($1,'Portal Administrator',$2,'executive') ON CONFLICT(email) DO NOTHING", [email, passwordHash]);
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
    if (configuredUsers.rows[0].count === 0) return res.status(503).json({ message: 'Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to create the first executive account.' });
    const body = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
    if (!body.success) return res.status(400).json({ message: 'Enter a valid email and password.' });
    const email = body.data.email.trim().toLowerCase();
    const { rows } = await authPool.query('SELECT id,email,name,password_hash AS "passwordHash",role FROM esg_users WHERE email=$1', [email]);
    if (!rows.length || !(await compare(body.data.password, rows[0].passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    const user = { id: Number(rows[0].id), email: rows[0].email, name: rows[0].name, role: rows[0].role as AppRole };
    res.json({ data: { user, token: issueToken(user) } });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (req, res) => res.json({ data: req.user }));

router.post('/users', requireAuth, allowRoles('executive'), async (req, res, next) => {
  const parsed = z.object({ email: z.string().email(), name: z.string().trim().min(1).max(120), password: z.string().min(12), role: z.enum(roles as [AppRole, ...AppRole[]]), entityIds: z.array(z.number().int().positive()).default([]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Check the user details. Passwords must be at least 12 characters.' });
  const client = await authPool.connect();
  try {
    await ensureAuthSchema();
    const { email, name, password, role, entityIds } = parsed.data;
    if ((role === 'engineer' || role === 'hse' || role === 'subsidiary_head') && entityIds.length === 0) return res.status(400).json({ message: 'Assign at least one site or subsidiary scope to this account.' });
    const allowedLevel = role === 'subsidiary_head' ? 'subsidiary' : 'site';
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
