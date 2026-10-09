import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { publishFormSchema, type FormField } from '@my-app/common';
import { accessibleSiteIds, accessibleSubsidiaryIds } from '../middleware/auth.js';
import { initDatabase } from '../db/schema.js';
import { db } from '../db/client.js';

export function serializeFormDescription(description: string, fields: FormField[] = []): string {
  return JSON.stringify({
    summary: description || '',
    fields: fields || [],
  });
}

export function parseFormDescription(raw: string | null | undefined): { description: string; fields: FormField[] } {
  if (!raw) return { description: '', fields: [] };
  if (raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          description: typeof parsed.summary === 'string' ? parsed.summary : '',
          fields: Array.isArray(parsed.fields) ? parsed.fields : [],
        };
      }
    } catch {
      // Fall through to plain text
    }
  }
  return { description: raw, fields: [] };
}

/**
 * GET /api/v1/forms
 * Fetch forms accessible to current user based on their role and scopes
 */
export async function getForms(req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();
    const user = req.user!;

    const allForms = await db.orm.public.EsgForms
      .include('esgUsers')
      .orderBy((f) => f.createdAt.desc())
      .all();

    let filtered = allForms;

    if (user.role === 'engineer') {
      const siteIds = await accessibleSiteIds(user);
      filtered = allForms.filter(
        (f) =>
          f.isActive &&
          (f.siteId === null || (siteIds !== null && siteIds.includes(Number(f.siteId))))
      );
    } else if (user.role === 'subsidiary_head') {
      const subIds = await accessibleSubsidiaryIds(user);
      filtered = allForms.filter(
        (f) =>
          f.createdBy === BigInt(user.id) ||
          (f.subsidiaryId !== null && subIds !== null && subIds.includes(Number(f.subsidiaryId)))
      );
    }

    const data = filtered.map((f) => {
      const parsedDesc = parseFormDescription(f.description);
      return {
        id: Number(f.id),
        title: f.title,
        description: parsedDesc.description,
        fields: parsedDesc.fields,
        pillar: f.pillar,
        metricCode: f.metricCode,
        defaultUnit: f.defaultUnit,
        allowedUnits: f.allowedUnits,
        requiresFileUpload: f.requiresFileUpload,
        fileInstruction: f.fileInstruction,
        siteId: f.siteId ? Number(f.siteId) : null,
        siteName: f.siteName,
        subsidiaryId: f.subsidiaryId ? Number(f.subsidiaryId) : null,
        isActive: f.isActive,
        createdAt: f.createdAt,
        createdByName: f.esgUsers?.name || null,
      };
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/forms
 * Publish a new form (Subsidiary Head or Executive)
 */
export async function publishForm(req: Request, res: Response, next: NextFunction) {
  const parsed = publishFormSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Validation failed for publishing form. Please check all required fields and custom inputs.',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    await initDatabase();
    const data = parsed.data;
    let siteName = 'All Assigned Sites';
    let subsidiaryId: bigint | null = null;

    if (data.siteId) {
      const site = await db.orm.public.EsgEntities.where((e) => e.id.eq(BigInt(data.siteId!))).first();
      if (site) {
        siteName = site.name;
        subsidiaryId = site.parentId;
      }
    }

    const allowedUnits = data.allowedUnits.length > 0 ? data.allowedUnits : [data.defaultUnit];
    const storedDescription = serializeFormDescription(data.description, data.fields);

    const createdForm = await db.orm.public.EsgForms.create({
      title: data.title,
      description: storedDescription,
      pillar: data.pillar,
      metricCode: data.metricCode,
      defaultUnit: data.defaultUnit,
      allowedUnits,
      requiresFileUpload: data.requiresFileUpload,
      fileInstruction: data.fileInstruction,
      siteId: data.siteId ? BigInt(data.siteId) : null,
      siteName,
      subsidiaryId,
      createdBy: BigInt(req.user!.id),
      isActive: true,
    });

    res.status(201).json({
      message: 'Form published successfully with custom inputs!',
      data: {
        id: Number(createdForm.id),
        title: createdForm.title,
        description: data.description,
        fields: data.fields,
        pillar: createdForm.pillar,
        metricCode: createdForm.metricCode,
        defaultUnit: createdForm.defaultUnit,
        allowedUnits: createdForm.allowedUnits,
        requiresFileUpload: createdForm.requiresFileUpload,
        fileInstruction: createdForm.fileInstruction,
        siteId: createdForm.siteId ? Number(createdForm.siteId) : null,
        siteName: createdForm.siteName,
        subsidiaryId: createdForm.subsidiaryId ? Number(createdForm.subsidiaryId) : null,
        isActive: createdForm.isActive,
        createdAt: createdForm.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/forms/:id/status
 * Toggle form active/inactive status
 */
export async function toggleFormStatus(req: Request, res: Response, next: NextFunction) {
  const parsed = z.object({ isActive: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'isActive boolean is required.' });
  }

  try {
    await initDatabase();
    const formId = BigInt(String(req.params.id));
    const existing = await db.orm.public.EsgForms.where((f) => f.id.eq(formId)).first();
    if (!existing) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    const updated = await db.orm.public.EsgForms.where((f) => f.id.eq(formId)).update({
      isActive: parsed.data.isActive,
    });

    if (!updated) {
      return res.status(500).json({ message: 'Failed to update form status.' });
    }

    res.json({
      message: 'Form status updated.',
      data: {
        id: Number(updated.id),
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
}
