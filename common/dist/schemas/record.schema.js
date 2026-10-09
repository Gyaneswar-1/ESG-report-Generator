import { z } from 'zod';
export const periodRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
export const esgRecordSubmissionSchema = z.object({
    siteId: z.coerce.number().int().positive('Please select a valid site'),
    formId: z.coerce.number().int().positive().optional().nullable(),
    period: z.string().regex(periodRegex, 'Period must be in YYYY-MM format (e.g. 2026-03)'),
    metricCode: z.string().trim().min(1, 'Metric code is required').max(60),
    metric: z.string().trim().min(1, 'Metric title is required').max(160),
    rawValue: z.coerce.number().finite().nonnegative('Value must be a non-negative number'),
    rawUnit: z.string().trim().min(1, 'Measurement unit is required').max(40),
    notes: z.string().trim().max(5000).optional().default(''),
    customData: z.record(z.string(), z.any()).optional().default({}),
});
export const recordReviewDecisionSchema = z.object({
    status: z.enum(['approved', 'rejected'], {
        message: 'Decision status must be approved or rejected',
    }),
    note: z.string().trim().max(1000).optional().default(''),
});
