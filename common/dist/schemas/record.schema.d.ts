import { z } from 'zod';
export declare const periodRegex: RegExp;
export declare const supportedMetricCodes: readonly ["diesel", "petrol", "cng", "png", "lpg", "coal", "electricity", "solar_generated", "water", "water_surface", "water_ground", "water_municipal", "water_recycled", "total_waste", "recycled_waste", "hazardous_waste", "plastic_waste", "e_waste", "lost_time_injuries", "working_hours", "training_hours", "fatalities", "permanent_employees", "women_employees", "other"];
export type SupportedMetricCode = (typeof supportedMetricCodes)[number];
/**
 * Statutory Emission Factors conforming to CEA India Baseline Database v19 & IPCC Guidelines
 */
export declare const STATUTORY_EMISSION_FACTORS: {
    diesel_liter: number;
    petrol_liter: number;
    cng_kg: number;
    png_scm: number;
    lpg_kg: number;
    coal_mt: number;
    electricity_grid_kwh: number;
    kwh_to_gj: number;
    mwh_to_gj: number;
    diesel_liter_to_gj: number;
    petrol_liter_to_gj: number;
    cng_kg_to_gj: number;
    png_scm_to_gj: number;
    lpg_kg_to_gj: number;
};
export interface NormalizationResult {
    normalizedValue: number;
    normalizedUnit: string;
    formula: string;
    pillar: 'environmental' | 'social' | 'governance';
}
/**
 * Normalizes field telemetry measurements into standard statutory reporting units (MT CO2e, kWh, kL, t, hours, incidents).
 */
export declare function normalizeTelemetry(metricCode: string, rawValue: number, rawUnitInput: string, declaredPillar?: 'environmental' | 'social' | 'governance'): NormalizationResult;
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
export declare const auditorAssuranceSchema: z.ZodObject<{
    financialYear: z.ZodDefault<z.ZodString>;
    assuranceStandard: z.ZodDefault<z.ZodEnum<{
        "ISAE 3000 (Revised)": "ISAE 3000 (Revised)";
        "ISO 14064-3": "ISO 14064-3";
        "SEBI Core Guidelines": "SEBI Core Guidelines";
    }>>;
    assuranceType: z.ZodDefault<z.ZodEnum<{
        "Reasonable Assurance": "Reasonable Assurance";
        "Limited Assurance": "Limited Assurance";
    }>>;
    assuranceProvider: z.ZodString;
    leadAuditor: z.ZodString;
    auditorRegistrationNo: z.ZodString;
    conclusionOpinion: z.ZodString;
}, z.core.$strip>;
export type AuditorAssuranceData = z.infer<typeof auditorAssuranceSchema>;
//# sourceMappingURL=record.schema.d.ts.map