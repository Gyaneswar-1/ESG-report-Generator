import { z } from 'zod';
export declare const brsrEntityMetadataSchema: z.ZodObject<{
    cin: z.ZodDefault<z.ZodString>;
    entityName: z.ZodDefault<z.ZodString>;
    incorporationYear: z.ZodDefault<z.ZodNumber>;
    registeredOffice: z.ZodDefault<z.ZodString>;
    corporateAddress: z.ZodDefault<z.ZodString>;
    email: z.ZodDefault<z.ZodString>;
    telephone: z.ZodDefault<z.ZodString>;
    website: z.ZodDefault<z.ZodString>;
    financialYear: z.ZodDefault<z.ZodString>;
    stockExchanges: z.ZodDefault<z.ZodArray<z.ZodString>>;
    paidUpCapital: z.ZodDefault<z.ZodString>;
    contactPerson: z.ZodObject<{
        name: z.ZodDefault<z.ZodString>;
        designation: z.ZodDefault<z.ZodString>;
        email: z.ZodDefault<z.ZodString>;
        telephone: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
    reportingBoundary: z.ZodDefault<z.ZodEnum<{
        standalone: "standalone";
        consolidated: "consolidated";
    }>>;
}, z.core.$strip>;
export type BrsrEntityMetadata = z.infer<typeof brsrEntityMetadataSchema>;
export declare const brsrBusinessActivitySchema: z.ZodObject<{
    id: z.ZodNumber;
    mainActivity: z.ZodString;
    businessActivity: z.ZodString;
    turnoverShare: z.ZodNumber;
}, z.core.$strip>;
export type BrsrBusinessActivity = z.infer<typeof brsrBusinessActivitySchema>;
export declare const brsrProductServiceSchema: z.ZodObject<{
    id: z.ZodNumber;
    productService: z.ZodString;
    nicCode: z.ZodString;
    turnoverShare: z.ZodNumber;
}, z.core.$strip>;
export type BrsrProductService = z.infer<typeof brsrProductServiceSchema>;
export declare const brsrOperationsSchema: z.ZodObject<{
    nationalPlants: z.ZodDefault<z.ZodNumber>;
    nationalOffices: z.ZodDefault<z.ZodNumber>;
    internationalPlants: z.ZodDefault<z.ZodNumber>;
    internationalOffices: z.ZodDefault<z.ZodNumber>;
    majorLocations: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type BrsrOperations = z.infer<typeof brsrOperationsSchema>;
export declare const brsrEmployeesSchema: z.ZodObject<{
    totalEmployees: z.ZodDefault<z.ZodNumber>;
    permanentMale: z.ZodDefault<z.ZodNumber>;
    permanentFemale: z.ZodDefault<z.ZodNumber>;
    otherMale: z.ZodDefault<z.ZodNumber>;
    otherFemale: z.ZodDefault<z.ZodNumber>;
    diffAbled: z.ZodDefault<z.ZodNumber>;
    womenLeadershipPercentage: z.ZodDefault<z.ZodNumber>;
    turnoverRatePercentage: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type BrsrEmployees = z.infer<typeof brsrEmployeesSchema>;
export declare const brsrSubsidiaryItemSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    type: z.ZodEnum<{
        holding: "holding";
        subsidiary: "subsidiary";
        associate: "associate";
        jv: "jv";
    }>;
    shareholdingPercent: z.ZodNumber;
    participatesInBrsr: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type BrsrSubsidiaryItem = z.infer<typeof brsrSubsidiaryItemSchema>;
export declare const brsrCsrDetailsSchema: z.ZodObject<{
    applicable: z.ZodDefault<z.ZodBoolean>;
    turnoverCr: z.ZodDefault<z.ZodNumber>;
    netWorthCr: z.ZodDefault<z.ZodNumber>;
    netProfitCr: z.ZodDefault<z.ZodNumber>;
    mandatoryCsrCr: z.ZodDefault<z.ZodNumber>;
    actualSpentCr: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type BrsrCsrDetails = z.infer<typeof brsrCsrDetailsSchema>;
export declare const brsrEnergyMetricsSchema: z.ZodObject<{
    electricityPurchasedGridMwh: z.ZodDefault<z.ZodNumber>;
    fuelDieselConsumedLiters: z.ZodDefault<z.ZodNumber>;
    fuelDieselConsumedGj: z.ZodDefault<z.ZodNumber>;
    totalEnergyGj: z.ZodDefault<z.ZodNumber>;
    renewableEnergyGj: z.ZodDefault<z.ZodNumber>;
    renewablePercentage: z.ZodDefault<z.ZodNumber>;
    energyIntensityPerTurnoverCr: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type BrsrEnergyMetrics = z.infer<typeof brsrEnergyMetricsSchema>;
export declare const brsrWaterMetricsSchema: z.ZodObject<{
    surfaceWaterKl: z.ZodDefault<z.ZodNumber>;
    groundwaterKl: z.ZodDefault<z.ZodNumber>;
    municipalWaterKl: z.ZodDefault<z.ZodNumber>;
    totalWithdrawalKl: z.ZodDefault<z.ZodNumber>;
    waterRecycledKl: z.ZodDefault<z.ZodNumber>;
    recyclingPercentage: z.ZodDefault<z.ZodNumber>;
    zeroLiquidDischarge: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type BrsrWaterMetrics = z.infer<typeof brsrWaterMetricsSchema>;
export declare const brsrGhgEmissionsSchema: z.ZodObject<{
    scope1Tco2e: z.ZodDefault<z.ZodNumber>;
    scope2Tco2e: z.ZodDefault<z.ZodNumber>;
    totalScope1And2Tco2e: z.ZodDefault<z.ZodNumber>;
    scope3Tco2e: z.ZodDefault<z.ZodNumber>;
    ghgIntensityPerTurnoverCr: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type BrsrGhgEmissions = z.infer<typeof brsrGhgEmissionsSchema>;
export declare const brsrWasteMetricsSchema: z.ZodObject<{
    plasticWasteMt: z.ZodDefault<z.ZodNumber>;
    eWasteMt: z.ZodDefault<z.ZodNumber>;
    hazardousWasteMt: z.ZodDefault<z.ZodNumber>;
    totalWasteGeneratedMt: z.ZodDefault<z.ZodNumber>;
    wasteDivertedFromDisposalMt: z.ZodDefault<z.ZodNumber>;
    diversionRatePercentage: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type BrsrWasteMetrics = z.infer<typeof brsrWasteMetricsSchema>;
export declare const brsrSafetyMetricsSchema: z.ZodObject<{
    totalWorkingHours: z.ZodDefault<z.ZodNumber>;
    lostTimeInjuryRate: z.ZodDefault<z.ZodNumber>;
    fatalities: z.ZodDefault<z.ZodNumber>;
    highConsequenceInjuries: z.ZodDefault<z.ZodNumber>;
    healthInsuranceCoveragePercent: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type BrsrSafetyMetrics = z.infer<typeof brsrSafetyMetricsSchema>;
export declare const brsrCoreKpiSchema: z.ZodObject<{
    attributeNo: z.ZodNumber;
    attributeName: z.ZodString;
    parameter: z.ZodString;
    currentFyValue: z.ZodString;
    previousFyValue: z.ZodString;
    unit: z.ZodString;
    assuranceStatus: z.ZodEnum<{
        "Reasonable Assurance": "Reasonable Assurance";
        "Limited Assurance": "Limited Assurance";
        Audited: "Audited";
        "Self-Declared": "Self-Declared";
    }>;
    standardReference: z.ZodString;
}, z.core.$strip>;
export type BrsrCoreKpi = z.infer<typeof brsrCoreKpiSchema>;
export declare const brsrAuditorAssuranceStatementSchema: z.ZodObject<{
    provider: z.ZodDefault<z.ZodString>;
    leadAuditor: z.ZodDefault<z.ZodString>;
    registrationNumber: z.ZodDefault<z.ZodString>;
    standard: z.ZodDefault<z.ZodString>;
    opinionType: z.ZodDefault<z.ZodEnum<{
        "Reasonable Assurance": "Reasonable Assurance";
        "Limited Assurance": "Limited Assurance";
        "Unqualified Opinion": "Unqualified Opinion";
    }>>;
    opinionText: z.ZodDefault<z.ZodString>;
    signedAt: z.ZodDefault<z.ZodString>;
    signatureHash: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type BrsrAuditorAssuranceStatement = z.infer<typeof brsrAuditorAssuranceStatementSchema>;
export declare const brsrFullDossierSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        cin: z.ZodDefault<z.ZodString>;
        entityName: z.ZodDefault<z.ZodString>;
        incorporationYear: z.ZodDefault<z.ZodNumber>;
        registeredOffice: z.ZodDefault<z.ZodString>;
        corporateAddress: z.ZodDefault<z.ZodString>;
        email: z.ZodDefault<z.ZodString>;
        telephone: z.ZodDefault<z.ZodString>;
        website: z.ZodDefault<z.ZodString>;
        financialYear: z.ZodDefault<z.ZodString>;
        stockExchanges: z.ZodDefault<z.ZodArray<z.ZodString>>;
        paidUpCapital: z.ZodDefault<z.ZodString>;
        contactPerson: z.ZodObject<{
            name: z.ZodDefault<z.ZodString>;
            designation: z.ZodDefault<z.ZodString>;
            email: z.ZodDefault<z.ZodString>;
            telephone: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>;
        reportingBoundary: z.ZodDefault<z.ZodEnum<{
            standalone: "standalone";
            consolidated: "consolidated";
        }>>;
    }, z.core.$strip>;
    businessActivities: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        mainActivity: z.ZodString;
        businessActivity: z.ZodString;
        turnoverShare: z.ZodNumber;
    }, z.core.$strip>>;
    products: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        productService: z.ZodString;
        nicCode: z.ZodString;
        turnoverShare: z.ZodNumber;
    }, z.core.$strip>>;
    operations: z.ZodObject<{
        nationalPlants: z.ZodDefault<z.ZodNumber>;
        nationalOffices: z.ZodDefault<z.ZodNumber>;
        internationalPlants: z.ZodDefault<z.ZodNumber>;
        internationalOffices: z.ZodDefault<z.ZodNumber>;
        majorLocations: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    employees: z.ZodObject<{
        totalEmployees: z.ZodDefault<z.ZodNumber>;
        permanentMale: z.ZodDefault<z.ZodNumber>;
        permanentFemale: z.ZodDefault<z.ZodNumber>;
        otherMale: z.ZodDefault<z.ZodNumber>;
        otherFemale: z.ZodDefault<z.ZodNumber>;
        diffAbled: z.ZodDefault<z.ZodNumber>;
        womenLeadershipPercentage: z.ZodDefault<z.ZodNumber>;
        turnoverRatePercentage: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    subsidiaries: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        type: z.ZodEnum<{
            holding: "holding";
            subsidiary: "subsidiary";
            associate: "associate";
            jv: "jv";
        }>;
        shareholdingPercent: z.ZodNumber;
        participatesInBrsr: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    csr: z.ZodObject<{
        applicable: z.ZodDefault<z.ZodBoolean>;
        turnoverCr: z.ZodDefault<z.ZodNumber>;
        netWorthCr: z.ZodDefault<z.ZodNumber>;
        netProfitCr: z.ZodDefault<z.ZodNumber>;
        mandatoryCsrCr: z.ZodDefault<z.ZodNumber>;
        actualSpentCr: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    energy: z.ZodObject<{
        electricityPurchasedGridMwh: z.ZodDefault<z.ZodNumber>;
        fuelDieselConsumedLiters: z.ZodDefault<z.ZodNumber>;
        fuelDieselConsumedGj: z.ZodDefault<z.ZodNumber>;
        totalEnergyGj: z.ZodDefault<z.ZodNumber>;
        renewableEnergyGj: z.ZodDefault<z.ZodNumber>;
        renewablePercentage: z.ZodDefault<z.ZodNumber>;
        energyIntensityPerTurnoverCr: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    water: z.ZodObject<{
        surfaceWaterKl: z.ZodDefault<z.ZodNumber>;
        groundwaterKl: z.ZodDefault<z.ZodNumber>;
        municipalWaterKl: z.ZodDefault<z.ZodNumber>;
        totalWithdrawalKl: z.ZodDefault<z.ZodNumber>;
        waterRecycledKl: z.ZodDefault<z.ZodNumber>;
        recyclingPercentage: z.ZodDefault<z.ZodNumber>;
        zeroLiquidDischarge: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    ghg: z.ZodObject<{
        scope1Tco2e: z.ZodDefault<z.ZodNumber>;
        scope2Tco2e: z.ZodDefault<z.ZodNumber>;
        totalScope1And2Tco2e: z.ZodDefault<z.ZodNumber>;
        scope3Tco2e: z.ZodDefault<z.ZodNumber>;
        ghgIntensityPerTurnoverCr: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    waste: z.ZodObject<{
        plasticWasteMt: z.ZodDefault<z.ZodNumber>;
        eWasteMt: z.ZodDefault<z.ZodNumber>;
        hazardousWasteMt: z.ZodDefault<z.ZodNumber>;
        totalWasteGeneratedMt: z.ZodDefault<z.ZodNumber>;
        wasteDivertedFromDisposalMt: z.ZodDefault<z.ZodNumber>;
        diversionRatePercentage: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    safety: z.ZodObject<{
        totalWorkingHours: z.ZodDefault<z.ZodNumber>;
        lostTimeInjuryRate: z.ZodDefault<z.ZodNumber>;
        fatalities: z.ZodDefault<z.ZodNumber>;
        highConsequenceInjuries: z.ZodDefault<z.ZodNumber>;
        healthInsuranceCoveragePercent: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    brsrCoreKpis: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        attributeNo: z.ZodNumber;
        attributeName: z.ZodString;
        parameter: z.ZodString;
        currentFyValue: z.ZodString;
        previousFyValue: z.ZodString;
        unit: z.ZodString;
        assuranceStatus: z.ZodEnum<{
            "Reasonable Assurance": "Reasonable Assurance";
            "Limited Assurance": "Limited Assurance";
            Audited: "Audited";
            "Self-Declared": "Self-Declared";
        }>;
        standardReference: z.ZodString;
    }, z.core.$strip>>>>;
    auditorAssurance: z.ZodOptional<z.ZodObject<{
        provider: z.ZodDefault<z.ZodString>;
        leadAuditor: z.ZodDefault<z.ZodString>;
        registrationNumber: z.ZodDefault<z.ZodString>;
        standard: z.ZodDefault<z.ZodString>;
        opinionType: z.ZodDefault<z.ZodEnum<{
            "Reasonable Assurance": "Reasonable Assurance";
            "Limited Assurance": "Limited Assurance";
            "Unqualified Opinion": "Unqualified Opinion";
        }>>;
        opinionText: z.ZodDefault<z.ZodString>;
        signedAt: z.ZodDefault<z.ZodString>;
        signatureHash: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>;
    generatedAt: z.ZodString;
    generatedBy: z.ZodString;
    sha256VerificationHash: z.ZodString;
    assuranceStatus: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type BrsrFullDossier = z.infer<typeof brsrFullDossierSchema>;
//# sourceMappingURL=brsr.schema.d.ts.map