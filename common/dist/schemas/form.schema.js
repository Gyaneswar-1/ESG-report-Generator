import { z } from 'zod';
export const formFieldTypeEnum = z.enum([
    'text',
    'number',
    'email',
    'date',
    'select',
    'textarea',
    'file',
    'checkbox',
]);
export const formFieldSchema = z.object({
    id: z.string().min(1),
    name: z
        .string()
        .trim()
        .min(1, 'Field key identifier is required')
        .regex(/^[a-zA-Z0-9_]+$/, 'Field identifier must contain only letters, numbers, and underscores'),
    label: z.string().trim().min(1, 'Field title/label is required'),
    type: formFieldTypeEnum,
    description: z.string().trim().optional(),
    placeholder: z.string().trim().optional(),
    required: z.boolean().optional().default(false),
    unit: z.string().trim().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    options: z.array(z.string().trim()).optional(),
    defaultValue: z.any().optional(),
});
export const publishFormSchema = z.object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(160, 'Title is too long'),
    description: z.string().trim().max(1000).optional().default(''),
    pillar: z.enum(['environmental', 'social', 'governance'], {
        message: 'Pillar must be environmental, social, or governance',
    }),
    metricCode: z.string().trim().min(2, 'Metric code is required').max(60),
    defaultUnit: z.string().trim().min(1, 'Default unit is required').max(30),
    allowedUnits: z.array(z.string().trim().min(1)).optional().default([]),
    requiresFileUpload: z.boolean().optional().default(true),
    fileInstruction: z.string().trim().max(500).optional().default('Upload bill or evidence (PDF/Image)'),
    siteId: z.number().int().positive().nullable().optional(),
    fields: z.array(formFieldSchema).optional().default([]),
});
/**
 * Builds a dynamic Zod validation schema for any set of custom form fields.
 * Validates all fields at once (email format, required numbers, text, dates, etc.)
 */
export function buildDynamicFormZodSchema(fields) {
    const shape = {};
    for (const field of fields) {
        let fieldValidator;
        switch (field.type) {
            case 'email': {
                const emailRule = z
                    .string()
                    .trim()
                    .email(`Please enter a valid email address for "${field.label}" (e.g. name@domain.com)`);
                if (field.required) {
                    fieldValidator = z
                        .string()
                        .trim()
                        .min(1, `"${field.label}" is required`)
                        .pipe(emailRule);
                }
                else {
                    fieldValidator = z
                        .string()
                        .trim()
                        .optional()
                        .or(z.literal(''))
                        .refine((val) => !val || z.string().email().safeParse(val).success, {
                        message: `Please enter a valid email address for "${field.label}"`,
                    });
                }
                break;
            }
            case 'number': {
                let numRule = z.coerce.number({
                    message: `"${field.label}" must be a valid number`,
                });
                if (typeof field.min === 'number') {
                    numRule = numRule.min(field.min, `"${field.label}" must be at least ${field.min}`);
                }
                if (typeof field.max === 'number') {
                    numRule = numRule.max(field.max, `"${field.label}" cannot exceed ${field.max}`);
                }
                if (field.required) {
                    fieldValidator = numRule;
                }
                else {
                    fieldValidator = z.preprocess((val) => {
                        if (val === '' || val === null || val === undefined)
                            return undefined;
                        return val;
                    }, numRule.optional());
                }
                break;
            }
            case 'date': {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (field.required) {
                    fieldValidator = z
                        .string()
                        .trim()
                        .min(1, `"${field.label}" date is required`)
                        .regex(dateRegex, `"${field.label}" must be formatted as YYYY-MM-DD`);
                }
                else {
                    fieldValidator = z
                        .string()
                        .trim()
                        .optional()
                        .or(z.literal(''))
                        .refine((val) => !val || dateRegex.test(val), {
                        message: `"${field.label}" must be formatted as YYYY-MM-DD`,
                    });
                }
                break;
            }
            case 'select': {
                if (field.required) {
                    let selRule = z
                        .string()
                        .trim()
                        .min(1, `Please select an option for "${field.label}"`);
                    if (field.options && field.options.length > 0) {
                        const opts = field.options;
                        selRule = selRule.refine((val) => opts.includes(val), {
                            message: `Please choose a valid option from the list for "${field.label}"`,
                        });
                    }
                    fieldValidator = selRule;
                }
                else {
                    fieldValidator = z.string().trim().optional().or(z.literal(''));
                }
                break;
            }
            case 'checkbox': {
                fieldValidator = z.boolean().optional().default(false);
                break;
            }
            case 'file': {
                if (field.required) {
                    fieldValidator = z.any().refine((val) => Boolean(val), {
                        message: `Please attach the required document for "${field.label}"`,
                    });
                }
                else {
                    fieldValidator = z.any().optional();
                }
                break;
            }
            case 'text':
            case 'textarea':
            default: {
                if (field.required) {
                    fieldValidator = z
                        .string()
                        .trim()
                        .min(1, `"${field.label}" is required`);
                }
                else {
                    fieldValidator = z.string().trim().optional().default('');
                }
                break;
            }
        }
        const fieldKey = field.name || field.key;
        if (fieldKey) {
            shape[fieldKey] = fieldValidator;
        }
    }
    return z.object(shape);
}
/**
 * Validates all form inputs at once against their defined field rules.
 * Returns a consolidated errors map containing messages for every failing input simultaneously.
 */
export function validateDynamicFormData(fields, values) {
    if (!fields || fields.length === 0) {
        return { isValid: true, errors: {}, data: values };
    }
    const schema = buildDynamicFormZodSchema(fields);
    const parsed = schema.safeParse(values);
    if (parsed.success) {
        return { isValid: true, errors: {}, data: parsed.data };
    }
    const fieldErrors = {};
    const flattened = parsed.error.flatten();
    for (const [key, messages] of Object.entries(flattened.fieldErrors)) {
        if (messages && messages.length > 0) {
            fieldErrors[key] = messages[0] || 'Invalid value';
        }
    }
    return {
        isValid: false,
        errors: fieldErrors,
    };
}
