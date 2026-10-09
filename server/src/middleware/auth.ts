import type { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

export type AppRole = 'engineer' | 'subsidiary_head' | 'executive' | 'auditor';
export interface AuthUser { id: number; email: string; name: string; role: AppRole }
declare global { namespace Express { interface Request { user?: AuthUser } } }

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined });
const secret = () => process.env.JWT_SECRET;

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  try {
    const claims = jwt.verify(token, secret() ?? '') as AuthUser;
    if (!['engineer', 'subsidiary_head', 'executive', 'auditor'].includes(claims.role)) return res.status(401).json({ message: 'This account role is no longer supported. Sign in with one of the four portal roles.' });
    req.user = claims;
    next();
  } catch { res.status(401).json({ message: 'Your session has expired. Sign in again.' }); }
};

export const allowRoles = (...roles: AppRole[]): RequestHandler => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'Your account does not have permission for this action.' });
  next();
};

export async function accessibleSiteIds(user: AuthUser): Promise<number[] | null> {
  if (user.role === 'executive' || user.role === 'auditor') return null;
  const { rows } = await pool.query(`WITH RECURSIVE visible_entities(id,level) AS (
    SELECT e.id,e.level FROM esg_user_scopes s JOIN esg_entities e ON e.id=s.entity_id WHERE s.user_id=$1
    UNION ALL SELECT child.id,child.level FROM esg_entities child JOIN visible_entities parent ON child.parent_id=parent.id
  ) SELECT id FROM visible_entities WHERE level='site'`, [user.id]);
  return rows.map((row) => Number(row.id));
}

export function jwtSecret() {
  const value = secret();
  if (!value || value.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  return value;
}

export const authPool = pool;
