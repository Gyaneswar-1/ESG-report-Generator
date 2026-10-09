import { z } from 'zod';
export declare const periodRegex: RegExp;
export declare const esgRecordSubmissionSchema: z.ZodObject<{
    siteId: z.ZodCoercedNumber<unknown>;
    formId: z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    period: z.ZodString;
    metricCode: z.ZodString;
    metric: z.ZodString;
    rawValue: z.ZodCoercedNumber<unknown>;
    rawUnit: z.ZodString;
    notes: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    customData: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, z.core.$strip>;
export type EsgRecordSubmissionData = z.infer<typeof esgRecordSubmissionSchema>;
export declare const recordReviewDecisionSchema: z.ZodObject<{
    status: z.ZodEnum<{
        approved: "approved";
        rejected: "rejected";
    }>;
    note: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type RecordReviewDecisionData = z.infer<typeof recordReviewDecisionSchema>;
//# sourceMappingURL=record.schema.d.ts.map