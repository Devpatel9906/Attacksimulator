const { z } = require('zod')

const employeeLoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1)
})

const employeeSetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character')
})

module.exports = { employeeLoginSchema, employeeSetPasswordSchema }