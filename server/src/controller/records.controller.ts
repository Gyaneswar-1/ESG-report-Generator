import type { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { accessibleSiteIds } from '../middleware/auth.js';
import { initDatabase } from '../db/schema.js';
import { uploadEvidenceFile } from '../utils/cloudinary.js';
import { db } from '../db/client.js';
import { validateDynamicFormData } from '@my-app/common';
import { parseFormDescription } from './forms.controller.js';

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents and image files (PNG, JPG, WEBP) are supported for evidence uploads.'));
    }
  },
});

export const uploadEvidence: RequestHandler = (req, res, next) =>
  upload.single('evidence')(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid evidence file.' });
    }
    next();
  });

const recordSchema = z.object({
  siteId: z.coerce.number().int().positive(),
  formId: z.coerce.number().int().positive().optional(),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  metricCode: z.string().trim().min(1).max(60),
  metric: z.string().trim().min(1).max(160),
  rawValue: z.coerce.number().finite().nonnegative(),
  rawUnit: z.string().trim().min(1).max(40),
  notes: z.string().trim().max(2000).optional().default(''),
  customData: z.string().optional().default(''),
});

const siteSchema = z.object({
  group: z.string().trim().min(1).max(120),
  subsidiary: z.string().trim().min(1).max(120),
  site: z.string().trim().min(1).max(120),
  region: z.string().trim().min(1).max(100),
});

/**
 * GET /api/v1/sites
 * Get all operational sites visible to user
 */
export async function getSites(req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();
    const visible = await accessibleSiteIds(req.user!);

    const allEntities = await db.orm.public.EsgEntities.all();
    const entityMap = new Map(allEntities.map((e) => [e.id.toString(), e]));

    const sites = allEntities
      .filter((e) => e.level === 'site')
      .filter((s) => visible === null || visible.includes(Number(s.id)))
      .map((s) => {
        const sub = s.parentId ? entityMap.get(s.parentId.toString()) : null;
        const grp = sub?.parentId ? entityMap.get(sub.parentId.toString()) : null;
        return {
          id: Number(s.id),
          name: s.name,
          region: s.region,
          subsidiary: sub?.name || '',
          subsidiaryId: sub ? Number(sub.id) : 0,
          group: grp?.name || 'MEIL Corporate Group',
        };
      })
      .sort((a, b) => a.group.localeCompare(b.group) || a.subsidiary.localeCompare(b.subsidiary) || a.name.localeCompare(b.name));

    res.json({ data: sites });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/sites
 * Add Site (CSO / Super Admin only)
 */
export async function createSite(req: Request, res: Response, next: NextFunction) {
  const parsed = siteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Enter a group, subsidiary, site and region.' });

  try {
    await initDatabase();
    const { group, subsidiary, site, region } = parsed.data;

    // Group
    let grp = await db.orm.public.EsgEntities
      .where((e) => e.name.eq(group))
      .where((e) => e.level.eq('group'))
      .first();

    if (!grp) {
      grp = await db.orm.public.EsgEntities.create({
        name: group,
        level: 'group',
        region: 'National',
      });
    }

    // Subsidiary
    let sub = await db.orm.public.EsgEntities
      .where((e) => e.name.eq(subsidiary))
      .where((e) => e.parentId.eq(grp!.id))
      .first();

    if (!sub) {
      sub = await db.orm.public.EsgEntities.create({
        name: subsidiary,
        level: 'subsidiary',
        parentId: grp!.id,
        region,
      });
    }

    // Site
    let siteEntity = await db.orm.public.EsgEntities
      .where((e) => e.name.eq(site))
      .where((e) => e.parentId.eq(sub.id))
      .first();

    if (!siteEntity) {
      siteEntity = await db.orm.public.EsgEntities.create({
        name: site,
        level: 'site',
        parentId: sub.id,
        region,
      });
    } else {
      siteEntity = await db.orm.public.EsgEntities.where((e) => e.id.eq(siteEntity!.id)).update({
        region,
      });
    }

    if (!siteEntity) {
      return res.status(500).json({ message: 'Failed to create site entity.' });
    }

    res.status(201).json({
      data: {
        id: Number(siteEntity.id),
        name: siteEntity.name,
        region: siteEntity.region,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/records
 * Fetch ESG measurement records
 */
export async function getRecords(req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();
    const visible = await accessibleSiteIds(req.user!);
    const querySiteId = req.query.siteId ? Number(req.query.siteId) : null;

    const records = await db.orm.public.EsgRecords
      .include('evidenceEsgEvidence')
      .orderBy((r) => r.createdAt.desc())
      .limit(300)
      .all();

    const filtered = records
      .filter((r) => {
        if (visible !== null && (!r.siteId || !visible.includes(Number(r.siteId)))) return false;
        if (querySiteId !== null && Number(r.siteId) !== querySiteId) return false;
        return true;
      })
      .map((r) => {
        let displayNotes = r.notes;
        let customData: Record<string, any> | null = null;
        if (r.notes && r.notes.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(r.notes);
            if (parsed && typeof parsed === 'object') {
              displayNotes = typeof parsed.notes === 'string' ? parsed.notes : '';
              customData = parsed.customData && typeof parsed.customData === 'object' ? parsed.customData : null;
            }
          } catch {}
        }

        return {
          id: Number(r.id),
          siteId: r.siteId ? Number(r.siteId) : null,
          site: r.site,
          period: r.period,
          pillar: r.pillar,
          metric: r.metric,
          metricCode: r.metricCode,
          value: Number(r.value),
          unit: r.unit,
          rawValue: Number(r.rawValue),
          rawUnit: r.rawUnit,
          formula: r.formula,
          enteredBy: r.enteredBy,
          role: r.role,
          notes: displayNotes,
          customData,
          evidenceId: r.evidenceId ? Number(r.evidenceId) : null,
          evidenceHash: r.evidenceEsgEvidence?.sha256 || '',
          evidenceName: r.evidenceEsgEvidence?.fileName || '',
          cloudinaryUrl: r.evidenceEsgEvidence?.cloudinaryUrl || '',
          createdAt: r.createdAt,
          reviewStatus: r.reviewStatus,
          reviewedBy: r.reviewedBy,
          reviewNote: r.reviewNote,
          reviewedAt: r.reviewedAt,
        };
      });

    res.json({ data: filtered });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/records/:id/audit
 * Get Record Audit History
 */
export async function getRecordAudit(req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();
    const recordId = BigInt(String(req.params.id));
    const visible = await accessibleSiteIds(req.user!);

    const record = await db.orm.public.EsgRecords.where((r) => r.id.eq(recordId)).first();
    if (!record || (visible !== null && (!record.siteId || !visible.includes(Number(record.siteId))))) {
      return res.status(404).json({ message: 'Record not found.' });
    }

    const audits = await db.orm.public.EsgRecordAudit
      .where((a) => a.recordId.eq(recordId))
      .include('evidence')
      .orderBy((a) => a.createdAt.desc())
      .all();

    const data = audits.map((a) => ({
      id: Number(a.id),
      action: a.action,
      rawValue: Number(a.rawValue),
      rawUnit: a.rawUnit,
      normalizedValue: Number(a.normalizedValue),
      normalizedUnit: a.normalizedUnit,
      formula: a.formula,
      enteredBy: a.enteredBy,
      role: a.role,
      createdAt: a.createdAt,
      evidenceId: a.evidenceId ? Number(a.evidenceId) : null,
      evidenceHash: a.evidence?.sha256 || '',
      evidenceName: a.evidence?.fileName || '',
      cloudinaryUrl: a.evidence?.cloudinaryUrl || '',
    }));

    res.json({ data });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/records/:id/review
 * Review Record (Approve / Reject Data Entry)
 */
export async function reviewRecord(req: Request, res: Response, next: NextFunction) {
  const body = z.object({
    status: z.enum(['approved', 'rejected']),
    note: z.string().trim().max(1000).optional().default(''),
  }).safeParse(req.body);

  if (!body.success) return res.status(400).json({ message: 'Choose approve or reject.' });

  try {
    await initDatabase();
    const recordId = BigInt(String(req.params.id));
    const siteIds = await accessibleSiteIds(req.user!);

    const record = await db.orm.public.EsgRecords.where((r) => r.id.eq(recordId)).first();
    if (!record || (siteIds !== null && (!record.siteId || !siteIds.includes(Number(record.siteId))))) {
      return res.status(404).json({ message: 'Record was not found in your assigned scope.' });
    }

    const updated = await db.orm.public.EsgRecords.where((r) => r.id.eq(recordId)).update({
      reviewStatus: body.data.status,
      reviewedBy: req.user!.name,
      reviewNote: body.data.note,
      reviewedAt: new Date().toISOString(),
    });

    if (!updated) {
      return res.status(500).json({ message: 'Failed to update record review status.' });
    }

    await db.orm.public.EsgRecordAudit.create({
      recordId: updated.id,
      action: body.data.status,
      rawValue: updated.rawValue,
      rawUnit: updated.rawUnit,
      normalizedValue: updated.value,
      normalizedUnit: updated.unit,
      formula: updated.formula,
      enteredBy: req.user!.name,
      role: req.user!.role,
      evidenceId: updated.evidenceId,
    });

    res.json({ data: { id: Number(updated.id), reviewStatus: body.data.status } });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/metrics
 * Dynamic Metrics Aggregation (CSO Executive Dashboard)
 */
export async function getMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();
    const region = typeof req.query.region === 'string' ? req.query.region.trim().toLowerCase() : null;

    const records = await db.orm.public.EsgRecords
      .include('siteEsgEntities')
      .all();

    const groups = new Map<string, {
      metricCode: string;
      metric: string;
      unit: string;
      total: number;
      siteIds: Set<string>;
      period: string;
    }>();

    for (const r of records) {
      if (region && r.siteEsgEntities?.region?.toLowerCase() !== region) {
        continue;
      }
      const code = r.metricCode || r.metric;
      const key = `${code}|${r.period}|${r.unit}`;
      let g = groups.get(key);
      if (!g) {
        g = {
          metricCode: code,
          metric: r.metric,
          unit: r.unit,
          total: 0,
          siteIds: new Set(),
          period: r.period,
        };
        groups.set(key, g);
      }
      g.total += Number(r.value);
      if (r.siteId) {
        g.siteIds.add(r.siteId.toString());
      }
    }

    const rows = Array.from(groups.values())
      .map((g) => ({
        metricCode: g.metricCode,
        metric: g.metric,
        unit: g.unit,
        total: g.total,
        siteCount: g.siteIds.size,
        period: g.period,
      }))
      .sort((a, b) => b.period.localeCompare(a.period) || a.metric.localeCompare(b.metric));

    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/records
 * Submit New ESG Measurement with Cloudinary Upload and Unit Normalization
 */
export async function createRecord(req: Request, res: Response, next: NextFunction) {
  const parsed = recordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Please check the required fields.', errors: parsed.error.flatten().fieldErrors });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Attach a valid PDF or image proof before saving this measurement.' });
  }

  try {
    await initDatabase();
    const record = parsed.data;

    // Validate site scope
    const siteIds = await accessibleSiteIds(req.user!);
    const site = await db.orm.public.EsgEntities.where((e) => e.id.eq(BigInt(record.siteId))).first();
    if (!site || site.level !== 'site' || (siteIds !== null && !siteIds.includes(Number(site.id)))) {
      return res.status(403).json({ message: 'Choose a site assigned to your account. Measurements can only be entered at site level.' });
    }

    // Normalization Engine & Math Interceptor
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
    } else if (record.metricCode === 'electricity' && ['kwh', 'kilowatt-hours'].includes(rawUnit)) {
      normalizedUnit = 'kWh';
      formula = 'Standard SEBI Electricity unit (kWh)';
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
    } else if (['total_waste', 'recycled_waste'].includes(record.metricCode) && ['tonne', 'tonnes', 'metric tons', 't'].includes(rawUnit)) {
      normalizedUnit = 't';
      formula = '1 metric tonne = 1 t';
    }

    // Module B: The IIM-A Guardrail System
    if (record.metricCode === 'recycled_waste' || record.metricCode === 'total_waste') {
      const pairCode = record.metricCode === 'recycled_waste' ? 'total_waste' : 'recycled_waste';
      const pair = await db.orm.public.EsgRecords
        .where((r) => r.siteId.eq(BigInt(record.siteId)))
        .where((r) => r.period.eq(record.period))
        .where((r) => r.metricCode.eq(pairCode))
        .first();

      const total = record.metricCode === 'total_waste' ? normalizedValue : Number(pair?.value ?? 0);
      const recycled = record.metricCode === 'recycled_waste' ? normalizedValue : Number(pair?.value ?? 0);
      if (recycled > total && total > 0) {
        return res.status(400).json({ message: 'Recycled waste cannot exceed total waste generated for this site and month.' });
      }
    }

    if (record.metricCode === 'lost_time_injuries' || record.metricCode === 'working_hours') {
      const pairCode = record.metricCode === 'lost_time_injuries' ? 'working_hours' : 'lost_time_injuries';
      const pair = await db.orm.public.EsgRecords
        .where((r) => r.siteId.eq(BigInt(record.siteId)))
        .where((r) => r.period.eq(record.period))
        .where((r) => r.metricCode.eq(pairCode))
        .first();

      const incidents = record.metricCode === 'lost_time_injuries' ? record.rawValue : Number(pair?.value ?? 0);
      const hours = record.metricCode === 'working_hours' ? record.rawValue : Number(pair?.value ?? 0);
      if (incidents > 0 && hours === 0) {
        return res.status(400).json({ message: 'Enter total working hours before reporting lost-time injuries.' });
      }
    }

    // Dynamic Form Custom Fields Validation via Zod
    let customValues: Record<string, any> = {};
    if (record.customData) {
      try {
        customValues = typeof record.customData === 'string' ? JSON.parse(record.customData) : record.customData;
      } catch {
        // malformed customData
      }
    }

    if (record.formId) {
      const form = await db.orm.public.EsgForms.where((f) => f.id.eq(BigInt(record.formId!))).first();
      if (form) {
        const parsedForm = parseFormDescription(form.description);
        if (parsedForm.fields && parsedForm.fields.length > 0) {
          const valResult = validateDynamicFormData(parsedForm.fields, customValues);
          if (!valResult.isValid) {
            return res.status(400).json({
              message: 'Validation failed for one or more dynamic form inputs.',
              errors: valResult.errors,
            });
          }
        }
      }
    }

    const storedNotes = Object.keys(customValues).length > 0
      ? JSON.stringify({ notes: record.notes, customData: customValues })
      : record.notes;

    // Evidence Vault: Upload to Cloudinary & local storage
    const uploadResult = await uploadEvidenceFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    let evidence = await db.orm.public.EsgEvidence.where((e) => e.sha256.eq(uploadResult.sha256)).first();
    if (!evidence) {
      evidence = await db.orm.public.EsgEvidence.create({
        sha256: uploadResult.sha256,
        fileName: req.file.originalname.slice(0, 250),
        storagePath: uploadResult.storagePath,
        cloudinaryUrl: uploadResult.cloudinaryUrl,
        cloudinaryPublicId: uploadResult.cloudinaryPublicId,
        mimeType: req.file.mimetype,
        byteSize: BigInt(req.file.size),
      });
    } else {
      evidence = await db.orm.public.EsgEvidence.where((e) => e.id.eq(evidence!.id)).update({
        cloudinaryUrl: uploadResult.cloudinaryUrl,
        cloudinaryPublicId: uploadResult.cloudinaryPublicId,
      });
    }

    if (!evidence) {
      return res.status(500).json({ message: 'Failed to save evidence.' });
    }

    const pillar = ['diesel', 'electricity', 'water', 'total_waste', 'recycled_waste'].includes(record.metricCode)
      ? 'environmental'
      : ['lost_time_injuries', 'working_hours'].includes(record.metricCode)
      ? 'social'
      : 'governance';

    const existingRecord = await db.orm.public.EsgRecords
      .where((r) => r.siteId.eq(BigInt(record.siteId)))
      .where((r) => r.period.eq(record.period))
      .where((r) => r.metricCode.eq(record.metricCode))
      .first();

    let savedRecord;
    if (existingRecord) {
      savedRecord = await db.orm.public.EsgRecords.where((r) => r.id.eq(existingRecord.id)).update({
        site: site.name,
        pillar,
        metric: record.metric,
        value: String(normalizedValue),
        unit: normalizedUnit,
        enteredBy: req.user!.name,
        role: req.user!.role,
        evidence: req.file.originalname,
        notes: storedNotes,
        rawValue: String(record.rawValue),
        rawUnit: record.rawUnit,
        formula,
        evidenceId: evidence.id,
        formId: record.formId ? BigInt(record.formId) : null,
        reviewStatus: 'pending',
        reviewedBy: null,
        reviewNote: null,
        reviewedAt: null,
      });
    } else {
      savedRecord = await db.orm.public.EsgRecords.create({
        site: site.name,
        period: record.period,
        pillar,
        metric: record.metric,
        value: String(normalizedValue),
        unit: normalizedUnit,
        enteredBy: req.user!.name,
        role: req.user!.role,
        evidence: req.file.originalname,
        notes: storedNotes,
        siteId: BigInt(record.siteId),
        formId: record.formId ? BigInt(record.formId) : null,
        metricCode: record.metricCode,
        rawValue: String(record.rawValue),
        rawUnit: record.rawUnit,
        formula,
        evidenceId: evidence.id,
        reviewStatus: 'pending',
      });
    }

    if (!savedRecord) {
      return res.status(500).json({ message: 'Failed to save record.' });
    }

    await db.orm.public.EsgRecordAudit.create({
      recordId: savedRecord.id,
      action: 'saved',
      rawValue: String(record.rawValue),
      rawUnit: record.rawUnit,
      normalizedValue: String(normalizedValue),
      normalizedUnit: normalizedUnit,
      formula,
      enteredBy: req.user!.name,
      role: req.user!.role,
      evidenceId: evidence.id,
    });

    res.status(201).json({
      data: {
        id: Number(savedRecord.id),
        site: savedRecord.site,
        period: savedRecord.period,
        pillar: savedRecord.pillar,
        metric: savedRecord.metric,
        metricCode: savedRecord.metricCode,
        value: Number(savedRecord.value),
        unit: savedRecord.unit,
        rawValue: Number(savedRecord.rawValue),
        rawUnit: savedRecord.rawUnit,
        formula: savedRecord.formula,
        enteredBy: savedRecord.enteredBy,
        role: savedRecord.role,
        notes: savedRecord.notes,
        evidenceId: Number(evidence.id),
        evidenceHash: uploadResult.sha256,
        evidenceName: req.file.originalname,
        cloudinaryUrl: uploadResult.cloudinaryUrl,
        createdAt: savedRecord.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/evidence/:id
 * Stream or Preview Evidence Document
 */
export async function getEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    await initDatabase();
    const evidenceId = BigInt(String(req.params.id));
    const visible = await accessibleSiteIds(req.user!);

    const evidence = await db.orm.public.EsgEvidence
      .where((e) => e.id.eq(evidenceId))
      .include('esgRecords')
      .first();

    if (!evidence) return res.status(404).json({ message: 'Evidence file not found.' });

    if (visible !== null) {
      const hasAccess = evidence.esgRecords.some((r) => r.siteId && visible.includes(Number(r.siteId)));
      if (!hasAccess && evidence.esgRecords.length > 0) {
        return res.status(404).json({ message: 'Evidence file not found.' });
      }
    }

    if (evidence.cloudinaryUrl && req.query.redirect === 'true') {
      return res.redirect(evidence.cloudinaryUrl);
    }

    res
      .type(evidence.mimeType || 'application/pdf')
      .setHeader('Content-Disposition', `inline; filename="${String(evidence.fileName).replace(/["\\\r\n]/g, '_')}"`)
      .setHeader('X-Content-SHA256', evidence.sha256)
      .sendFile(evidence.storagePath);
  } catch (error) {
    next(error);
  }
}
