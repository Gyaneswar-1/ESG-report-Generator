import { z } from 'zod';
export const periodRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
export const supportedMetricCodes = [
    'diesel',
    'petrol',
    'cng',
    'png',
    'lpg',
    'coal',
    'electricity',
    'solar_generated',
    'water',
    'water_surface',
    'water_ground',
    'water_municipal',
    'water_recycled',
    'total_waste',
    'recycled_waste',
    'hazardous_waste',
    'plastic_waste',
    'e_waste',
    'lost_time_injuries',
    'working_hours',
    'training_hours',
    'fatalities',
    'permanent_employees',
    'women_employees',
    'other',
];
/**
 * Statutory Emission Factors conforming to CEA India Baseline Database v19 & IPCC Guidelines
 */
export const STATUTORY_EMISSION_FACTORS = {
    // Fuel to MT CO2e factors
    diesel_liter: 0.00268, // 2.68 kg CO2e / L
    petrol_liter: 0.00231, // 2.31 kg CO2e / L
    cng_kg: 0.00269, // 2.69 kg CO2e / kg
    png_scm: 0.0019, // 1.90 kg CO2e / Standard Cubic Meter
    lpg_kg: 0.00298, // 2.98 kg CO2e / kg
    coal_mt: 2.42, // 2.42 MT CO2e / MT
    // Electricity to MT CO2e
    electricity_grid_kwh: 0.000716, // CEA Baseline v19: 0.716 kg CO2e / kWh
    // Energy in Gigajoules (GJ)
    kwh_to_gj: 0.0036,
    mwh_to_gj: 3.6,
    diesel_liter_to_gj: 0.036,
    petrol_liter_to_gj: 0.033,
    cng_kg_to_gj: 0.05,
    png_scm_to_gj: 0.038,
    lpg_kg_to_gj: 0.046,
};
/**
 * Normalizes field telemetry measurements into standard statutory reporting units (MT CO2e, kWh, kL, t, hours, incidents).
 */
export function normalizeTelemetry(metricCode, rawValue, rawUnitInput, declaredPillar) {
    const code = metricCode.toLowerCase().trim();
    const rawUnit = rawUnitInput.toLowerCase().trim();
    // 1. Environmental: Scope 1 Fuels -> MT CO2e
    if (code === 'diesel') {
        if (['liter', 'liters', 'l'].includes(rawUnit)) {
            return {
                normalizedValue: Number(((rawValue * 2.68) / 1000).toFixed(4)),
                normalizedUnit: 'MT CO2e',
                formula: 'MT CO2e = (liters × 2.68 kg CO2e) ÷ 1,000',
                pillar: 'environmental',
            };
        }
        if (['kl', 'kiloliter', 'kiloliters'].includes(rawUnit)) {
            return {
                normalizedValue: Number((rawValue * 2.68).toFixed(4)),
                normalizedUnit: 'MT CO2e',
                formula: 'MT CO2e = kL × 2.68 MT CO2e/kL',
                pillar: 'environmental',
            };
        }
    }
    if (code === 'petrol') {
        if (['liter', 'liters', 'l'].includes(rawUnit)) {
            return {
                normalizedValue: Number(((rawValue * 2.31) / 1000).toFixed(4)),
                normalizedUnit: 'MT CO2e',
                formula: 'MT CO2e = (liters × 2.31 kg CO2e) ÷ 1,000',
                pillar: 'environmental',
            };
        }
    }
    if (code === 'cng') {
        if (['kg', 'kilogram', 'kilograms'].includes(rawUnit)) {
            return {
                normalizedValue: Number(((rawValue * 2.69) / 1000).toFixed(4)),
                normalizedUnit: 'MT CO2e',
                formula: 'MT CO2e = (kg × 2.69 kg CO2e) ÷ 1,000',
                pillar: 'environmental',
            };
        }
    }
    if (code === 'png') {
        if (['scm', 'm3', 'standard cubic meter'].includes(rawUnit)) {
            return {
                normalizedValue: Number(((rawValue * 1.90) / 1000).toFixed(4)),
                normalizedUnit: 'MT CO2e',
                formula: 'MT CO2e = (SCM × 1.90 kg CO2e) ÷ 1,000',
                pillar: 'environmental',
            };
        }
    }
    if (code === 'lpg') {
        if (['kg', 'kilogram', 'kilograms'].includes(rawUnit)) {
            return {
                normalizedValue: Number(((rawValue * 2.98) / 1000).toFixed(4)),
                normalizedUnit: 'MT CO2e',
                formula: 'MT CO2e = (kg × 2.98 kg CO2e) ÷ 1,000',
                pillar: 'environmental',
            };
        }
    }
    if (code === 'coal') {
        if (['mt', 't', 'tonne', 'tonnes'].includes(rawUnit)) {
            return {
                normalizedValue: Number((rawValue * 2.42).toFixed(4)),
                normalizedUnit: 'MT CO2e',
                formula: 'MT CO2e = tonnes × 2.42 MT CO2e/tonne',
                pillar: 'environmental',
            };
        }
    }
    // 2. Environmental: Electricity -> kWh
    if (code === 'electricity' || code === 'solar_generated') {
        if (['mwh', 'megawatt-hours', 'megawatt-hour'].includes(rawUnit)) {
            return {
                normalizedValue: rawValue * 1000,
                normalizedUnit: 'kWh',
                formula: 'kWh = MWh × 1,000',
                pillar: 'environmental',
            };
        }
        if (['kwh', 'kilowatt-hours', 'kilowatt-hour'].includes(rawUnit)) {
            return {
                normalizedValue: rawValue,
                normalizedUnit: 'kWh',
                formula: 'SEBI Electricity standard unit (kWh)',
                pillar: 'environmental',
            };
        }
    }
    // 3. Environmental: Water -> kL
    if (['water', 'water_surface', 'water_ground', 'water_municipal', 'water_recycled'].includes(code)) {
        if (['liter', 'liters', 'l'].includes(rawUnit)) {
            return {
                normalizedValue: Number((rawValue / 1000).toFixed(3)),
                normalizedUnit: 'kL',
                formula: 'kL = liters ÷ 1,000',
                pillar: 'environmental',
            };
        }
        if (['m3', 'm³', 'cubic meter', 'cubic meters'].includes(rawUnit)) {
            return {
                normalizedValue: rawValue,
                normalizedUnit: 'kL',
                formula: '1 m³ = 1 kL',
                pillar: 'environmental',
            };
        }
        if (['kl', 'kiloliter', 'kiloliters'].includes(rawUnit)) {
            return {
                normalizedValue: rawValue,
                normalizedUnit: 'kL',
                formula: 'SEBI Water standard unit (kL)',
                pillar: 'environmental',
            };
        }
    }
    // 4. Environmental: Waste -> t (Metric Tonnes)
    if (['total_waste', 'recycled_waste', 'hazardous_waste', 'plastic_waste', 'e_waste'].includes(code)) {
        if (['kg', 'kilogram', 'kilograms'].includes(rawUnit)) {
            return {
                normalizedValue: Number((rawValue / 1000).toFixed(4)),
                normalizedUnit: 't',
                formula: 't = kg ÷ 1,000',
                pillar: 'environmental',
            };
        }
        if (['t', 'tonne', 'tonnes', 'mt', 'metric ton', 'metric tons'].includes(rawUnit)) {
            return {
                normalizedValue: rawValue,
                normalizedUnit: 't',
                formula: 'SEBI Waste standard unit (t)',
                pillar: 'environmental',
            };
        }
    }
    // 5. Social & Governance
    if (['lost_time_injuries', 'fatalities'].includes(code)) {
        return {
            normalizedValue: rawValue,
            normalizedUnit: 'incidents',
            formula: 'Direct incident count',
            pillar: 'social',
        };
    }
    if (['working_hours', 'training_hours'].includes(code)) {
        return {
            normalizedValue: rawValue,
            normalizedUnit: 'hours',
            formula: 'Workforce hours total',
            pillar: 'social',
        };
    }
    // Fallback: inherit declared pillar from form, or determine by category
    const determinedPillar = declaredPillar || (['diesel', 'petrol', 'cng', 'png', 'lpg', 'coal', 'electricity', 'solar_generated', 'water', 'total_waste', 'recycled_waste'].includes(code)
        ? 'environmental'
        : ['lost_time_injuries', 'working_hours', 'fatalities', 'training_hours', 'permanent_employees', 'women_employees'].includes(code)
            ? 'social'
            : 'governance');
    return {
        normalizedValue: rawValue,
        normalizedUnit: rawUnitInput,
        formula: 'Standard reporting unit',
        pillar: determinedPillar,
    };
}
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
export const auditorAssuranceSchema = z.object({
    financialYear: z.string().default('2025-26'),
    assuranceStandard: z.enum(['ISAE 3000 (Revised)', 'ISO 14064-3', 'SEBI Core Guidelines']).default('ISAE 3000 (Revised)'),
    assuranceType: z.enum(['Reasonable Assurance', 'Limited Assurance']).default('Reasonable Assurance'),
    assuranceProvider: z.string().min(2, 'Assurance firm name is required'),
    leadAuditor: z.string().min(2, 'Lead auditor name is required'),
    auditorRegistrationNo: z.string().min(2, 'Registration / License number is required'),
    conclusionOpinion: z.string().min(10, 'Assurance conclusion opinion is required'),
});
