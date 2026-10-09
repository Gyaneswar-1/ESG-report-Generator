import { z } from 'zod';

export const userRoleEnum = z.enum(['engineer', 'subsidiary_head', 'executive', 'auditor']);
export type UserRoleType = z.infer<typeof userRoleEnum>;

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .toLowerCase()
  .email('Please enter a valid email address (e.g. name@domain.com)');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  role: userRoleEnum,
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['engineer', 'subsidiary_head', 'auditor'], {
    message: 'Please select a valid role',
  }),
  siteIds: z.array(z.number().int().positive()).optional().default([]),
  subsidiaryIds: z.array(z.number().int().positive()).optional().default([]),
});

export const userApprovalDecisionSchema = z.object({
  decision: z.enum(['approve', 'reject', 'pending'], {
    message: 'Decision must be approve, reject, or pending',
  }),
  note: z.string().trim().max(1000).optional().default(''),
});
