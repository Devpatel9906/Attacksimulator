const Papa = require('papaparse')
const { z } = require('zod')

const VALID_ROLES = [
  'admin',
  'it_support',
  'finance_manager',
  'finance_analyst',
  'hr_manager',
  'general_employee'
]

const CSV_ROW_SCHEMA = z.object({
  firstname: z.string().min(1).max(100).trim(),
  lastname: z.string().min(1).max(100).trim(),
  email: z.string().email().max(254).toLowerCase().trim(),
  phone: z.string().optional().or(z.literal('')),
  role: z.enum(VALID_ROLES),
  department: z.string().min(1).max(100).trim(),
  manager_email: z.string().email().optional().or(z.literal(''))
})

function processEmployeeCSV(buffer) {

  const csvString = buffer.toString('utf8')

  const parsed = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) =>
      h.trim().toLowerCase().replace(/\s+/g, '_')
  })

  const results = {
    valid: [],
    invalid: [],
    duplicateEmails: []
  }

  const seenEmails = new Set()

  for (let i = 0; i < parsed.data.length; i++) {

    const row = parsed.data[i]
    const rowNum = i + 2

    const validation = CSV_ROW_SCHEMA.safeParse(row)

    if (!validation.success) {

      results.invalid.push({
        row: rowNum,
        data: row,
        errors: validation.error.errors.map(
          e => `${e.path.join('.')}: ${e.message}`
        )
      })

      continue
    }

    const clean = validation.data

    if (seenEmails.has(clean.email)) {
      results.duplicateEmails.push({
        row: rowNum,
        email: clean.email
      })
      continue
    }

    seenEmails.add(clean.email)

    results.valid.push({
      firstName: clean.firstname,
      lastName: clean.lastname,
      email: clean.email,
      phone: clean.phone || null,
      role: clean.role,
      department: clean.department,
      manager_email: clean.manager_email || null
    })
  }

  return results
}

module.exports = { processEmployeeCSV }