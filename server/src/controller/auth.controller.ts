import type { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { jwtSecret, type AppRole, accessibleSiteIds } from '../middleware/auth.js';
import { initDatabase } from '../db/schema.js';
import { db } from '../db/client.js';

const roles: AppRole[] = ['engineer', 'subsidiary_head', 'executive', 'auditor'];

export const issueToken = (user: {
  id: number;
  email: string;
  name: string;
  role: AppRole;
  isProfileCompleted?: boolean;
  isApproved?: boolean;
  approvalStatus?: string;
}) => jwt.sign(user, jwtSecret(), { expiresIn: '8h' });

/**
 * POST /api/v1/auth/login
 * User login supporting CSO .env bootstrap and standard users via Prisma ORM
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(503).json({ message: 'Set JWT_SECRET to at least 32 characters in the server environment.' });
    }

    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
        role: z.enum(roles as [AppRole, ...AppRole[]]),
      })
      .safeParse(req.body);

    if (!body.success) {
      return res.status(400).json({ message: 'Choose a role and enter a valid email and password.' });
    }

    const email = body.data.email.trim().toLowerCase();

    // CSO / Executive Super Admin: Authenticate directly against .env defined credentials
    if (body.data.role === 'executive') {
      const envEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || 's.r.sahoo370@gmail.com').trim().toLowerCase();
      const envPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'YourStrongPassword123!';

      const configuredPassBuf = Buffer.from(envPassword);
      const submittedPassBuf = Buffer.from(body.data.password);
      const isPasswordMatch =
        configuredPassBuf.length === submittedPassBuf.length &&
        timingSafeEqual(configuredPassBuf, submittedPassBuf);

      if (email !== envEmail || !isPasswordMatch) {
        return res.status(401).json({
          message: 'Invalid CSO credentials. Please use the email and password defined in the .env configuration.',
        });
      }

      // Ensure CSO user exists in the database with executive role and approval
      let dbUser = await db.orm.public.EsgUsers.where((u) => u.email.eq(envEmail)).first();
      const passwordHash = await hash(envPassword, 12);

      if (!dbUser) {
        dbUser = await db.orm.public.EsgUsers.create({
          email: envEmail,
          name: 'CSO / Super Admin',
          passwordHash,
          role: 'executive',
          isProfileCompleted: true,
          isApproved: true,
          approvalStatus: 'approved',
          department: 'Executive Committee',
          designation: 'Chief Sustainability Officer',
          organization: 'MEIL Corporate',
          location: 'Bhubaneswar HQ',
        });
      } else if (dbUser.role !== 'executive' || !dbUser.isApproved || !dbUser.isProfileCompleted) {
        const updatedUser = await db.orm.public.EsgUsers.where((u) => u.id.eq(dbUser!.id)).update({
          passwordHash,
          role: 'executive',
          isProfileCompleted: true,
          isApproved: true,
          approvalStatus: 'approved',
        });
        if (updatedUser) dbUser = updatedUser;
      }

      if (!dbUser) {
        return res.status(500).json({ message: 'Failed to load CSO user.' });
      }

      const user = {
        id: Number(dbUser.id),
        email: dbUser.email,
        name: dbUser.name,
        role: 'executive' as const,
        isProfileCompleted: true,
        isApproved: true,
        approvalStatus: 'approved' as const,
        phone: dbUser.phone || '',
        employeeId: dbUser.employeeId || '',
        department: dbUser.department || 'Executive Committee',
        designation: dbUser.designation || 'Chief Sustainability Officer',
        qualifications: dbUser.qualifications || '',
        organization: dbUser.organization || 'MEIL Corporate',
        location: dbUser.location || 'Bhubaneswar HQ',
        reviewNote: dbUser.reviewNote || '',
      };

      return res.json({ data: { user, token: issueToken(user) } });
    }

    // Other roles: Query user using Prisma ORM
    const dbUser = await db.orm.public.EsgUsers.where((u) => u.email.eq(email)).first();

    if (!dbUser) {
      return res.status(401).json({ message: 'No account found for this email and role. Please sign up first.' });
    }

    if (dbUser.role !== body.data.role) {
      return res.status(401).json({
        message: `This account is registered as ${dbUser.role.replace('_', ' ')}. Please select the correct role.`,
      });
    }

    const passwordMatch = await compare(body.data.password, dbUser.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email or password is incorrect for the selected role.' });
    }

    const user = {
      id: Number(dbUser.id),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as AppRole,
      isProfileCompleted: Boolean(dbUser.isProfileCompleted),
      isApproved: Boolean(dbUser.isApproved),
      approvalStatus: dbUser.approvalStatus as 'pending' | 'approved' | 'rejected',
      phone: dbUser.phone || '',
      employeeId: dbUser.employeeId || '',
      department: dbUser.department || '',
      designation: dbUser.designation || '',
      qualifications: dbUser.qualifications || '',
      organization: dbUser.organization || '',
      location: dbUser.location || '',
      reviewNote: dbUser.reviewNote || '',
    };

    return res.json({ data: { user, token: issueToken(user) } });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/signup
 * New user registration
 */
export async function signup(req: Request, res: Response, next: NextFunction) {
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(120),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(roles as [AppRole, ...AppRole[]]),
      siteIds: z.array(z.number().int().positive()).optional().default([]),
      subsidiaryIds: z.array(z.number().int().positive()).optional().default([]),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Enter your name, email, role, and a password of at least 8 characters.' });
  }

  // The CSO does not need registration
  if (parsed.data.role === 'executive') {
    return res.status(400).json({
      message: 'The CSO account does not require registration. Please log in directly with the pre-configured credentials from the server environment (.env).',
    });
  }

  try {
    await initDatabase();
    const { name, email, password, role, siteIds, subsidiaryIds } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing account with Prisma ORM
    const existing = await db.orm.public.EsgUsers.where((u) => u.email.eq(normalizedEmail)).first();
    if (existing) {
      return res.status(409).json({ message: 'An account already exists for that email. Please sign in instead.' });
    }

    const passwordHash = await hash(password, 12);

    // Resolve subsidiary IDs and site IDs
    const resolvedSubIds = new Set<number>(subsidiaryIds);
    const resolvedSiteIds = new Set<number>(siteIds);

    // If siteIds provided but no subsidiaryIds, deduce subsidiary from site parent
    if (resolvedSiteIds.size > 0 && resolvedSubIds.size === 0) {
      const allSites = await db.orm.public.EsgEntities.where((e) => e.level.eq('site')).all();
      for (const sId of resolvedSiteIds) {
        const found = allSites.find((s) => Number(s.id) === sId);
        if (found && found.parentId) {
          resolvedSubIds.add(Number(found.parentId));
        }
      }
    }

    let organizationName = '';
    if (resolvedSubIds.size > 0) {
      const allSubs = await db.orm.public.EsgEntities.where((e) => e.level.eq('subsidiary')).all();
      const firstSub = allSubs.find((s) => resolvedSubIds.has(Number(s.id)));
      if (firstSub) {
        organizationName = firstSub.name;
      }
    }

    // Create user with Prisma ORM
    const createdUser = await db.orm.public.EsgUsers.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      isProfileCompleted: false,
      isApproved: false,
      approvalStatus: 'pending',
      organization: organizationName,
    });

    // Assign site scopes
    if (resolvedSiteIds.size > 0) {
      for (const siteId of resolvedSiteIds) {
        try {
          await db.orm.public.EsgUserScopes.create({
            userId: createdUser.id,
            entityId: BigInt(siteId),
          });
        } catch {
          // ignore duplicate scope
        }
      }
    }

    // Assign subsidiary scopes (for both engineer and subsidiary_head)
    if (resolvedSubIds.size > 0) {
      for (const subId of resolvedSubIds) {
        try {
          await db.orm.public.EsgUserScopes.create({
            userId: createdUser.id,
            entityId: BigInt(subId),
          });
        } catch {
          // ignore duplicate scope
        }
      }
    }

    const newUser = {
      id: Number(createdUser.id),
      email: normalizedEmail,
      name,
      role,
      isProfileCompleted: false,
      isApproved: false,
      approvalStatus: 'pending' as const,
    };

    res.status(201).json({
      message: 'Account created successfully! Please complete your profile.',
      data: {
        user: newUser,
        token: issueToken(newUser),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/me
 * Get current authenticated user details
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();

    const row = await db.orm.public.EsgUsers.where((u) => u.id.eq(BigInt(req.user!.id))).first();
    if (!row) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = {
      id: Number(row.id),
      email: row.email,
      name: row.name,
      role: row.role as AppRole,
      isProfileCompleted: Boolean(row.isProfileCompleted),
      isApproved: Boolean(row.isApproved),
      approvalStatus: row.approvalStatus as 'pending' | 'approved' | 'rejected',
      phone: row.phone || '',
      employeeId: row.employeeId || '',
      department: row.department || '',
      designation: row.designation || '',
      qualifications: row.qualifications || '',
      organization: row.organization || '',
      location: row.location || '',
      reviewNote: row.reviewNote || '',
    };

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/auth/profile
 * Mandatory Profile Completion Form submission
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  const profileSchema = z.object({
    phone: z.string().trim().min(5, 'Phone number must be at least 5 digits').max(30),
    employeeId: z.string().trim().min(1, 'Employee ID is required').max(60),
    department: z.string().trim().min(1, 'Department is required').max(120),
    designation: z.string().trim().min(1, 'Designation is required').max(120),
    qualifications: z.string().trim().max(300).optional().default(''),
    organization: z.string().trim().max(160).optional().default('MEIL Group'),
    location: z.string().trim().max(160).optional().default(''),
    siteIds: z.array(z.number().int().positive()).optional(),
    subsidiaryIds: z.array(z.number().int().positive()).optional(),
  });

  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Please complete all required profile details.',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    await initDatabase();
    const data = parsed.data;

    const existingUser = await db.orm.public.EsgUsers.where((u) => u.id.eq(BigInt(req.user!.id))).first();
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resolvedSubIds = new Set<number>(data.subsidiaryIds || []);
    const resolvedSiteIds = new Set<number>(data.siteIds || []);

    if (resolvedSiteIds.size > 0 && resolvedSubIds.size === 0) {
      const allSites = await db.orm.public.EsgEntities.where((e) => e.level.eq('site')).all();
      for (const sId of resolvedSiteIds) {
        const found = allSites.find((s) => Number(s.id) === sId);
        if (found && found.parentId) {
          resolvedSubIds.add(Number(found.parentId));
        }
      }
    }

    let organizationName = data.organization;
    if ((!organizationName || organizationName === 'MEIL Group' || organizationName === 'MEIL Corporate Group') && resolvedSubIds.size > 0) {
      const allSubs = await db.orm.public.EsgEntities.where((e) => e.level.eq('subsidiary')).all();
      const firstSub = allSubs.find((s) => resolvedSubIds.has(Number(s.id)));
      if (firstSub) {
        organizationName = firstSub.name;
      }
    }

    const updated = await db.orm.public.EsgUsers.where((u) => u.id.eq(BigInt(req.user!.id))).update({
      phone: data.phone,
      employeeId: data.employeeId,
      department: data.department,
      designation: data.designation,
      qualifications: data.qualifications,
      organization: organizationName,
      location: data.location,
      isProfileCompleted: true,
    });

    if (resolvedSiteIds.size > 0) {
      for (const siteId of resolvedSiteIds) {
        try {
          await db.orm.public.EsgUserScopes.create({
            userId: BigInt(req.user!.id),
            entityId: BigInt(siteId),
          });
        } catch {
          // ignore duplicate scope
        }
      }
    }

    if (resolvedSubIds.size > 0) {
      for (const subId of resolvedSubIds) {
        try {
          await db.orm.public.EsgUserScopes.create({
            userId: BigInt(req.user!.id),
            entityId: BigInt(subId),
          });
        } catch {
          // ignore duplicate scope
        }
      }
    }

    if (!updated) {
      return res.status(500).json({ message: 'Failed to update profile.' });
    }

    const user = {
      id: Number(updated.id),
      email: updated.email,
      name: updated.name,
      role: updated.role as AppRole,
      isProfileCompleted: true,
      isApproved: Boolean(updated.isApproved),
      approvalStatus: updated.approvalStatus as 'pending' | 'approved' | 'rejected',
      phone: updated.phone,
      employeeId: updated.employeeId,
      department: updated.department,
      designation: updated.designation,
      qualifications: updated.qualifications,
      organization: updated.organization,
      location: updated.location,
      reviewNote: updated.reviewNote || '',
    };

    res.json({
      message: 'Profile completed successfully!',
      data: {
        user,
        token: issueToken(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Helper to retrieve all subsidiary/company IDs associated with an engineer
 * (via direct subsidiary scope, parent of assigned site, or organization match).
 */
export async function getEngineerSubsidiaryIds(engineerId: bigint | number): Promise<number[]> {
  const allEntities = await db.orm.public.EsgEntities.all();
  const entityMap = new Map<string, typeof allEntities[0]>(allEntities.map((e) => [e.id.toString(), e]));

  const scopes = await db.orm.public.EsgUserScopes.where((s) => s.userId.eq(BigInt(engineerId))).all();
  const subIds = new Set<number>();

  for (const sc of scopes) {
    const ent = entityMap.get(sc.entityId.toString());
    if (!ent) continue;
    if (ent.level === 'subsidiary') {
      subIds.add(Number(ent.id));
    } else if (ent.level === 'site' && ent.parentId) {
      subIds.add(Number(ent.parentId));
    }
  }

  // Fallback: match by user organization name
  if (subIds.size === 0) {
    const user = await db.orm.public.EsgUsers.where((u) => u.id.eq(BigInt(engineerId))).first();
    if (user?.organization) {
      const orgMatch = allEntities.find(
        (e) => e.level === 'subsidiary' && e.name.toLowerCase().trim() === user.organization.toLowerCase().trim()
      );
      if (orgMatch) {
        subIds.add(Number(orgMatch.id));
      }
    }
  }

  return Array.from(subIds);
}

/**
 * Helper to retrieve all subsidiary/company IDs overseen by a subsidiary head.
 */
export async function getSubsidiaryHeadSubsidiaryIds(subHeadId: bigint | number): Promise<number[]> {
  const allEntities = await db.orm.public.EsgEntities.all();
  const scopes = await db.orm.public.EsgUserScopes.where((s) => s.userId.eq(BigInt(subHeadId))).all();
  const subIds = new Set<number>();

  for (const sc of scopes) {
    const ent = allEntities.find((e) => e.id === sc.entityId);
    if (ent && ent.level === 'subsidiary') {
      subIds.add(Number(ent.id));
    }
  }

  // Fallback: match by organization
  if (subIds.size === 0) {
    const user = await db.orm.public.EsgUsers.where((u) => u.id.eq(BigInt(subHeadId))).first();
    if (user?.organization) {
      const orgMatch = allEntities.find(
        (e) => e.level === 'subsidiary' && e.name.toLowerCase().trim() === user.organization.toLowerCase().trim()
      );
      if (orgMatch) {
        subIds.add(Number(orgMatch.id));
      }
    }
  }

  return Array.from(subIds);
}

/**
 * GET /api/v1/auth/pending-approvals
 * Pending Approvals list based on Role Hierarchy:
 * - Subsidiary Heads can ONLY see site engineers belonging to the same company.
 * - CSO Administrators can see all registrations across companies.
 */
export async function getPendingApprovals(req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();
    const currentUserRole = req.user!.role;

    if (currentUserRole !== 'subsidiary_head' && currentUserRole !== 'executive') {
      return res.status(403).json({
        message: 'Only Subsidiary Heads and CSO Administrators can review account registrations.',
      });
    }

    const allScopes = await db.orm.public.EsgUserScopes.include('entity').all();
    const scopesByUser = new Map<string, Array<{ id: number; name: string; region: string; level: string }>>();
    for (const s of allScopes) {
      const uId = s.userId.toString();
      if (!scopesByUser.has(uId)) {
        scopesByUser.set(uId, []);
      }
      if (s.entity) {
        scopesByUser.get(uId)!.push({
          id: Number(s.entity.id),
          name: s.entity.name,
          region: s.entity.region,
          level: s.entity.level,
        });
      }
    }

    const allEntities = await db.orm.public.EsgEntities.all();

    if (currentUserRole === 'subsidiary_head') {
      const headSubIds = await getSubsidiaryHeadSubsidiaryIds(req.user!.id);

      const engineers = await db.orm.public.EsgUsers
        .where((u) => u.role.eq('engineer'))
        .orderBy((u) => u.createdAt.desc())
        .all();

      const result = [];
      for (const u of engineers) {
        const engSubIds = await getEngineerSubsidiaryIds(u.id);
        const isSameCompany = engSubIds.some((id) => headSubIds.includes(id));
        if (!isSameCompany) continue;

        const userScopesList = scopesByUser.get(u.id.toString()) || [];
        const sites = userScopesList.filter((e) => e.level === 'site');
        const compEntity = allEntities.find((e) => e.level === 'subsidiary' && engSubIds.includes(Number(e.id)));

        result.push({
          id: Number(u.id),
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          employeeId: u.employeeId,
          department: u.department,
          designation: u.designation,
          qualifications: u.qualifications,
          location: u.location,
          organization: u.organization || (compEntity ? compEntity.name : ''),
          approvalStatus: u.approvalStatus,
          isApproved: u.isApproved,
          isProfileCompleted: u.isProfileCompleted,
          reviewNote: u.reviewNote,
          reviewedAt: u.reviewedAt,
          createdAt: u.createdAt,
          sites,
          scopes: userScopesList,
          company: compEntity ? { id: Number(compEntity.id), name: compEntity.name, region: compEntity.region } : null,
        });
      }

      return res.json({ data: result });
    }

    if (currentUserRole === 'executive') {
      const allUsers = await db.orm.public.EsgUsers.orderBy((u) => u.createdAt.desc()).all();
      const managedUsers = allUsers.filter(
        (u) => ['subsidiary_head', 'auditor', 'engineer'].includes(u.role)
      );

      const result = [];
      for (const u of managedUsers) {
        const userScopesList = scopesByUser.get(u.id.toString()) || [];
        const sites = userScopesList.filter((e) => e.level === 'site');
        const engSubIds = await getEngineerSubsidiaryIds(u.id);
        const compEntity = allEntities.find((e) => e.level === 'subsidiary' && engSubIds.includes(Number(e.id)));

        result.push({
          id: Number(u.id),
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          employeeId: u.employeeId,
          department: u.department,
          designation: u.designation,
          qualifications: u.qualifications,
          location: u.location,
          organization: u.organization || (compEntity ? compEntity.name : ''),
          approvalStatus: u.approvalStatus,
          isApproved: u.isApproved,
          isProfileCompleted: u.isProfileCompleted,
          reviewNote: u.reviewNote,
          reviewedAt: u.reviewedAt,
          createdAt: u.createdAt,
          sites,
          scopes: userScopesList,
          company: compEntity ? { id: Number(compEntity.id), name: compEntity.name, region: compEntity.region } : null,
        });
      }

      return res.json({ data: result });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/auth/approvals/:id
 * Approve, reject, or reset a user approval status.
 * Subsidiary Heads can ONLY approve site engineers belonging to the SAME company.
 */
export async function decideApproval(req: Request, res: Response, next: NextFunction) {
  const schema = z.object({
    decision: z.enum(['approve', 'reject', 'pending']),
    note: z.string().trim().max(1000).optional().default(''),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Specify a valid decision: approve, reject, or pending.' });
  }

  try {
    await initDatabase();
    const targetUserId = BigInt(String(req.params.id));
    const { decision, note } = parsed.data;
    const currentUserRole = req.user!.role;

    if (currentUserRole !== 'subsidiary_head' && currentUserRole !== 'executive') {
      return res.status(403).json({ message: 'Only Subsidiary Heads and CSO Administrators can make approval decisions.' });
    }

    const targetUser = await db.orm.public.EsgUsers.where((u) => u.id.eq(targetUserId)).first();
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (currentUserRole === 'subsidiary_head') {
      if (targetUser.role !== 'engineer') {
        return res.status(403).json({ message: 'Subsidiary Heads can only approve Site Engineers.' });
      }

      // STRICT VALIDATION: Subsidiary Head can only approve site engineers of the SAME company
      const headSubIds = await getSubsidiaryHeadSubsidiaryIds(req.user!.id);
      const engineerSubIds = await getEngineerSubsidiaryIds(targetUser.id);

      const isSameCompany = engineerSubIds.some((id) => headSubIds.includes(id));
      if (!isSameCompany) {
        return res.status(403).json({
          message: 'Access denied: Subsidiary Heads can only approve Site Engineers belonging to their own company.',
        });
      }
    }

    const isApproved = decision === 'approve';
    const approvalStatus = decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'pending';

    await db.orm.public.EsgUsers.where((u) => u.id.eq(targetUserId)).update({
      isApproved,
      approvalStatus,
      reviewedBy: BigInt(req.user!.id),
      reviewNote: note,
      reviewedAt: new Date().toISOString(),
    });

    const actionWord = decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'reset to pending';
    res.json({
      message: `Account for ${targetUser.name} has been ${actionWord}.`,
      data: {
        id: Number(targetUser.id),
        approvalStatus,
        isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/public/sites
 * Public sites list for Site Engineers during registration
 */
export async function getPublicSites(_req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();
    const sites = await db.orm.public.EsgEntities.where((e) => e.level.eq('site')).include('parent').all();

    const data = sites
      .map((s) => ({
        id: Number(s.id),
        name: s.name,
        region: s.region,
        subsidiary: s.parent?.name || '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ data });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/public/subsidiaries
 * Public subsidiaries list for registrations, including each company's designated Subsidiary Head
 */
export async function getPublicSubsidiaries(_req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();
    const subs = await db.orm.public.EsgEntities.where((e) => e.level.eq('subsidiary')).all();
    const sites = await db.orm.public.EsgEntities.where((e) => e.level.eq('site')).all();
    const subHeads = await db.orm.public.EsgUsers.where((u) => u.role.eq('subsidiary_head')).all();
    const scopes = await db.orm.public.EsgUserScopes.all();

    const userIdsByEntity = new Map<string, string[]>();
    for (const sc of scopes) {
      const entKey = sc.entityId.toString();
      if (!userIdsByEntity.has(entKey)) {
        userIdsByEntity.set(entKey, []);
      }
      userIdsByEntity.get(entKey)!.push(sc.userId.toString());
    }

    const subHeadById = new Map(subHeads.map((u) => [u.id.toString(), u]));

    const data = subs
      .map((s) => {
        const candidateUserIds = userIdsByEntity.get(s.id.toString()) || [];
        const matchingHeads = candidateUserIds
          .map((id) => subHeadById.get(id))
          .filter((u): u is typeof subHeads[0] => Boolean(u));

        if (matchingHeads.length === 0) {
          const orgMatch = subHeads.find(
            (sh) => sh.organization && sh.organization.toLowerCase().trim() === s.name.toLowerCase().trim()
          );
          if (orgMatch) matchingHeads.push(orgMatch);
        }

        const primaryHead =
          matchingHeads.find((h) => h.isApproved && h.approvalStatus === 'approved') ||
          matchingHeads.find((h) => h.approvalStatus !== 'rejected') ||
          matchingHeads[0] ||
          null;

        const subSites = sites
          .filter((st) => st.parentId === s.id)
          .map((st) => ({
            id: Number(st.id),
            name: st.name,
            region: st.region,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        return {
          id: Number(s.id),
          name: s.name,
          region: s.region,
          subHead: primaryHead
            ? {
                id: Number(primaryHead.id),
                name: primaryHead.name,
                email: primaryHead.email,
                designation: primaryHead.designation || 'Subsidiary Head',
                department: primaryHead.department || '',
                isApproved: Boolean(primaryHead.isApproved),
                approvalStatus: primaryHead.approvalStatus,
              }
            : null,
          subHeadName: primaryHead ? primaryHead.name : 'Unassigned / Awaiting Appointment',
          subHeadTitle: primaryHead ? (primaryHead.designation || 'Subsidiary Head') : 'Position Open',
          sites: subSites,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ data });
  } catch (error) {
    next(error);
  }
}
