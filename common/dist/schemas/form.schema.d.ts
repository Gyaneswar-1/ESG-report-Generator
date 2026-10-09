import { z } from 'zod';
export declare const formFieldTypeEnum: z.ZodEnum<{
    number: "number";
    text: "text";
    email: "email";
    date: "date";
    select: "select";
    textarea: "textarea";
    file: "file";
    checkbox: "checkbox";
}>;
export type FormFieldType = z.infer<typeof formFieldTypeEnum>;
export declare const formFieldSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    label: z.ZodString;
    type: z.ZodEnum<{
        number: "number";
        text: "text";
        email: "email";
        date: "date";
        select: "select";
        textarea: "textarea";
        file: "file";
        checkbox: "checkbox";
    }>;
    description: z.ZodOptional<z.ZodString>;
    placeholder: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    unit: z.ZodOptional<z.ZodString>;
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    options: z.ZodOptional<z.ZodArray<z.ZodString>>;
    defaultValue: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export type FormField = z.infer<typeof formFieldSchema>;
export declare const publishFormSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    pillar: z.ZodEnum<{
        environmental: "environmental";
        social: "social";
        governance: "governance";
    }>;
    metricCode: z.ZodString;
    defaultUnit: z.ZodString;
    allowedUnits: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    requiresFileUpload: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    fileInstruction: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    siteId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    fields: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        label: z.ZodString;
        type: z.ZodEnum<{
            number: "number";
            text: "text";
            email: "email";
            date: "date";
            select: "select";
            textarea: "textarea";
            file: "file";
            checkbox: "checkbox";
        }>;
        description: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        unit: z.ZodOptional<z.ZodString>;
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
        options: z.ZodOptional<z.ZodArray<z.ZodString>>;
        defaultValue: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
export type PublishFormData = z.infer<typeof publishFormSchema>;
/**
 * Builds a dynamic Zod validation schema for any set of custom form fields.
 * Validates all fields at once (email format, required numbers, text, dates, etc.)
 */
export declare function buildDynamicFormZodSchema(fields: FormField[]): z.ZodObject<{
    [x: string]: z.ZodTypeAny<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
}, z.core.$strip>;
export interface DynamicFormValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
    data?: Record<string, any>;
}
/**
 * Validates all form inputs at once against their defined field rules.
 * Returns a consolidated errors map containing messages for every failing input simultaneously.
 */
export declare function validateDynamicFormData(fields: FormField[], values: Record<string, any>): DynamicFormValidationResult;
//# sourceMappingURL=form.schema.d.ts.map