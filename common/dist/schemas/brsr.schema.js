import { z } from 'zod';
export const brsrEntityMetadataSchema = z.object({
    cin: z.string().default('L24100MH2001PLC132904'),
    entityName: z.string().default('Apex Megastructure & Infrastructure Holdings Ltd'),
    incorporationYear: z.number().int().default(2001),
    registeredOffice: z.string().default('Plot 42, Bandra-Kurla Complex, Bandra (East), Mumbai 400051, Maharashtra, India'),
    corporateAddress: z.string().default('Tower B, Apex World Centre, Financial District, Hyderabad 500032, Telangana, India'),
    email: z.string().email().default('esg-compliance@apexmega.com'),
    telephone: z.string().default('+91 22 6982 4400'),
    website: z.string().default('https://www.apexmega-holdings.com'),
    financialYear: z.string().default('2025-26'),
    stockExchanges: z.array(z.string()).default(['National Stock Exchange of India (NSE)', 'BSE Limited (BSE)']),
    paidUpCapital: z.string().default('₹ 482.50 Crores'),
    contactPerson: z.object({
        name: z.string().default('Dr. Meenakshi Sundaram'),
        designation: z.string().default('Chief Sustainability Officer & VP Corporate Affairs'),
        email: z.string().email().default('cso@apexmega.com'),
        telephone: z.string().default('+91 22 6982 4415'),
    }),
    reportingBoundary: z.enum(['standalone', 'consolidated']).default('consolidated'),
});
export const brsrBusinessActivitySchema = z.object({
    id: z.number().int(),
    mainActivity: z.string(),
    businessActivity: z.string(),
    turnoverShare: z.number(),
});
export const brsrProductServiceSchema = z.object({
    id: z.number().int(),
    productService: z.string(),
    nicCode: z.string(),
    turnoverShare: z.number(),
});
export const brsrOperationsSchema = z.object({
    nationalPlants: z.number().int().default(5),
    nationalOffices: z.number().int().default(3),
    internationalPlants: z.number().int().default(0),
    internationalOffices: z.number().int().default(1),
    majorLocations: z.array(z.string()).default([
        'Bhubaneswar Water Grid (Odisha)',
        'Cuttack Pipeline Grid (Odisha)',
        'Rourkela Power Substation (Odisha)',
        'Hyderabad Solar Hub (Telangana)',
        'Vijayawada Expressway Project (Andhra Pradesh)',
    ]),
});
export const brsrEmployeesSchema = z.object({
    totalEmployees: z.number().int().default(4850),
    permanentMale: z.number().int().default(3840),
    permanentFemale: z.number().int().default(1010),
    otherMale: z.number().int().default(2300),
    otherFemale: z.number().int().default(420),
    diffAbled: z.number().int().default(38),
    womenLeadershipPercentage: z.number().default(42.0),
    turnoverRatePercentage: z.number().default(7.4),
});
export const brsrSubsidiaryItemSchema = z.object({
    id: z.number().int(),
    name: z.string(),
    type: z.enum(['holding', 'subsidiary', 'associate', 'jv']),
    shareholdingPercent: z.number(),
    participatesInBrsr: z.boolean().default(true),
});
export const brsrCsrDetailsSchema = z.object({
    applicable: z.boolean().default(true),
    turnoverCr: z.number().default(8450.0),
    netWorthCr: z.number().default(2100.0),
    netProfitCr: z.number().default(740.0),
    mandatoryCsrCr: z.number().default(14.8),
    actualSpentCr: z.number().default(14.8),
});
export const brsrEnergyMetricsSchema = z.object({
    electricityPurchasedGridMwh: z.number().default(12950),
    fuelDieselConsumedLiters: z.number().default(2063432),
    fuelDieselConsumedGj: z.number().default(74283),
    totalEnergyGj: z.number().default(120903),
    renewableEnergyGj: z.number().default(82818),
    renewablePercentage: z.number().default(68.5),
    energyIntensityPerTurnoverCr: z.number().default(14.3),
});
export const brsrWaterMetricsSchema = z.object({
    surfaceWaterKl: z.number().default(28000),
    groundwaterKl: z.number().default(42000),
    municipalWaterKl: z.number().default(55000),
    totalWithdrawalKl: z.number().default(125000),
    waterRecycledKl: z.number().default(92750),
    recyclingPercentage: z.number().default(74.2),
    zeroLiquidDischarge: z.boolean().default(true),
});
export const brsrGhgEmissionsSchema = z.object({
    scope1Tco2e: z.number().default(5530.0),
    scope2Tco2e: z.number().default(12950.0),
    totalScope1And2Tco2e: z.number().default(18480.0),
    scope3Tco2e: z.number().default(41100.0),
    ghgIntensityPerTurnoverCr: z.number().default(2.18),
});
export const brsrWasteMetricsSchema = z.object({
    plasticWasteMt: z.number().default(145.2),
    eWasteMt: z.number().default(24.8),
    hazardousWasteMt: z.number().default(310.4),
    totalWasteGeneratedMt: z.number().default(3280.0),
    wasteDivertedFromDisposalMt: z.number().default(3011.0),
    diversionRatePercentage: z.number().default(91.8),
});
export const brsrSafetyMetricsSchema = z.object({
    totalWorkingHours: z.number().default(9700000),
    lostTimeInjuryRate: z.number().default(0.12),
    fatalities: z.number().default(0),
    highConsequenceInjuries: z.number().default(0),
    healthInsuranceCoveragePercent: z.number().default(100.0),
});
export const brsrCoreKpiSchema = z.object({
    attributeNo: z.number().int(),
    attributeName: z.string(),
    parameter: z.string(),
    currentFyValue: z.string(),
    previousFyValue: z.string(),
    unit: z.string(),
    assuranceStatus: z.enum(['Reasonable Assurance', 'Limited Assurance', 'Audited', 'Self-Declared']),
    standardReference: z.string(),
});
export const brsrAuditorAssuranceStatementSchema = z.object({
    provider: z.string().default('KPMG / BSR & Co. LLP'),
    leadAuditor: z.string().default('Dr. Arindam Sen, FCA, Lead Sustainability Assurance Partner'),
    registrationNumber: z.string().default('ICAI-FRN-101248W / SEBI-ESG-AUD-042'),
    standard: z.string().default('ISAE 3000 (Revised) & ISO 14064-3'),
    opinionType: z.enum(['Reasonable Assurance', 'Limited Assurance', 'Unqualified Opinion']).default('Reasonable Assurance'),
    opinionText: z.string().default('In our opinion, based on substantive sampling and cryptographic evidence verification across operational leaf sites, the ESG disclosures fairly present the sustainability performance of the listed entity in all material respects.'),
    signedAt: z.string().default('2026-04-15T10:00:00.000Z'),
    signatureHash: z.string().default(''),
});
export const brsrFullDossierSchema = z.object({
    metadata: brsrEntityMetadataSchema,
    businessActivities: z.array(brsrBusinessActivitySchema),
    products: z.array(brsrProductServiceSchema),
    operations: brsrOperationsSchema,
    employees: brsrEmployeesSchema,
    subsidiaries: z.array(brsrSubsidiaryItemSchema),
    csr: brsrCsrDetailsSchema,
    energy: brsrEnergyMetricsSchema,
    water: brsrWaterMetricsSchema,
    ghg: brsrGhgEmissionsSchema,
    waste: brsrWasteMetricsSchema,
    safety: brsrSafetyMetricsSchema,
    brsrCoreKpis: z.array(brsrCoreKpiSchema).optional().default([]),
    auditorAssurance: brsrAuditorAssuranceStatementSchema.optional(),
    generatedAt: z.string(),
    generatedBy: z.string(),
    sha256VerificationHash: z.string(),
    assuranceStatus: z.string().default('Reasonable Assurance - ISO 14064 & SEBI Mandate'),
});
