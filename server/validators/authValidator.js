const { z } = require('zod')

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim()
    .refine(
      val => !/<[^>]*>/.test(val),
      'Name contains invalid characters'
    ),

  email: z
    .string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long'),

  role: z
    .enum(['admin', 'analyst', 'defender', 'employee'])
    .optional()
    .default('employee'),

  organizationId: z
    .string()
    .optional()
    .nullable()
})

const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(254)
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password too long')
})

module.exports = { registerSchema, loginSchema }