import { z } from 'zod';
export declare const userRoleEnum: z.ZodEnum<{
    engineer: "engineer";
    subsidiary_head: "subsidiary_head";
    executive: "executive";
    auditor: "auditor";
}>;
export type UserRoleType = z.infer<typeof userRoleEnum>;
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<{
        engineer: "engineer";
        subsidiary_head: "subsidiary_head";
        executive: "executive";
        auditor: "auditor";
    }>;
}, z.core.$strip>;
export declare const signupSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<{
        engineer: "engineer";
        subsidiary_head: "subsidiary_head";
        auditor: "auditor";
    }>;
    siteIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber>>>;
    subsidiaryIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber>>>;
}, z.core.$strip>;
export declare const userApprovalDecisionSchema: z.ZodObject<{
    decision: z.ZodEnum<{
        approve: "approve";
        reject: "reject";
        pending: "pending";
    }>;
    note: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=auth.schema.d.ts.map