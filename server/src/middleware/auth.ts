import type { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/client.js';

export type AppRole = 'engineer' | 'subsidiary_head' | 'executive' | 'auditor';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: AppRole;
  isProfileCompleted?: boolean;
  isApproved?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const secret = () => process.env.JWT_SECRET;

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  try {
    const claims = jwt.verify(token, secret() ?? '') as AuthUser;
    if (!['engineer', 'subsidiary_head', 'executive', 'auditor'].includes(claims.role)) {
      return res.status(401).json({ message: 'Invalid session role. Please sign in again.' });
    }
    req.user = claims;
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Sign in again.' });
  }
};

/**
 * Middleware enforcing the workflow requirement:
 * Logged in -> Profile completed -> Approved by upper-level role
 */
export const requireApproved: RequestHandler = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Sign in to continue.' });

  // Executive (CSO) is always approved
  if (req.user.role === 'executive') return next();

  try {
    const user = await db.orm.public.EsgUsers.where((u) => u.id.eq(BigInt(req.user!.id))).first();

    if (!user) return res.status(401).json({ message: 'User account not found.' });

    if (!user.isProfileCompleted) {
      return res.status(403).json({
        code: 'PROFILE_INCOMPLETE',
        message: 'You must complete your profile before accessing this resource.',
      });
    }

    if (!user.isApproved || user.approvalStatus !== 'approved') {
      return res.status(403).json({
        code: 'APPROVAL_PENDING',
        message: 'Your account is awaiting approval from your upper-level role.',
        approvalStatus: user.approvalStatus,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const allowRoles = (...roles: AppRole[]): RequestHandler => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Your account does not have permission for this action.' });
  }
  next();
};

export async function accessibleSiteIds(user: AuthUser): Promise<number[] | null> {
  if (user.role === 'executive' || user.role === 'auditor') return null;

  const scopes = await db.orm.public.EsgUserScopes.where((s) => s.userId.eq(BigInt(user.id))).all();
  if (scopes.length === 0) return [];

  const scopedEntityIds = new Set(scopes.map((s) => s.entityId.toString()));
  const allEntities = await db.orm.public.EsgEntities.all();

  const siteIds: number[] = [];
  for (const entity of allEntities) {
    if (entity.level === 'site') {
      let current: typeof entity | undefined = entity;
      while (current) {
        if (scopedEntityIds.has(current.id.toString())) {
          siteIds.push(Number(entity.id));
          break;
        }
        current = allEntities.find((e) => e.id === current?.parentId);
      }
    }
  }

  return siteIds;
}

export async function accessibleSubsidiaryIds(user: AuthUser): Promise<number[] | null> {
  if (user.role === 'executive' || user.role === 'auditor') return null;

  const scopes = await db.orm.public.EsgUserScopes.where((s) => s.userId.eq(BigInt(user.id))).all();
  const scopedEntityIds = new Set(scopes.map((s) => s.entityId.toString()));
  const subsidiaries = await db.orm.public.EsgEntities.where((e) => e.level.eq('subsidiary')).all();

  return subsidiaries
    .filter((sub) => scopedEntityIds.has(sub.id.toString()))
    .map((sub) => Number(sub.id));
}

export function jwtSecret() {
  const value = secret();
  if (!value || value.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  return value;
}
