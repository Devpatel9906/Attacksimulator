const { authenticate } = require('../middleware/authenticate')
const { authorize } = require('../middleware/authorize')
const { hardeningPipeline } = require('../middleware/hardeningPipeline')
const { importEmployees } = require('../controllers/employeeImportController')

const Employee = require('../models/Employee')

const {
  createOrganization,
  getOrganization,
  addDepartment,
  getDepartments,
  addEmployee,
  getEmployees,
  getEmployee,
  bulkUploadEmployees
} = require('../controllers/orgController')

async function orgRoutes(fastify, opts) {

  fastify.addHook('onRequest', authenticate)

  fastify.post(
    '/orgs',
    { preHandler: [authorize(['admin'])] },
    createOrganization
  )

  fastify.get(
    '/orgs/:orgId',
    { preHandler: [authorize(['admin', 'analyst', 'defender'])] },
    getOrganization
  )

  fastify.post(
    '/orgs/:orgId/departments',
    { preHandler: [authorize(['admin'])] },
    addDepartment
  )

  fastify.get(
    '/orgs/:orgId/departments',
    { preHandler: [authorize(['admin', 'analyst', 'defender'])] },
    getDepartments
  )

  fastify.post(
    '/orgs/:orgId/employees',
    { preHandler: [authorize(['admin'])] },
    addEmployee
  )

  fastify.get(
    '/orgs/:orgId/employees',
    { preHandler: [authorize(['admin', 'analyst', 'defender'])] },
    getEmployees
  )

  fastify.get(
    '/orgs/:orgId/employees/:employeeId',
    { preHandler: [authorize(['admin', 'analyst', 'defender'])] },
    getEmployee
  )

  fastify.post(
    '/orgs/:orgId/employees/bulk',
    { preHandler: [authorize(['admin']), hardeningPipeline] },
    bulkUploadEmployees
  )

  // CSV import employees
  fastify.post(
    '/employees/import',
    { preHandler: [authorize(['admin']), hardeningPipeline] },
    importEmployees
  )

  // NEW: Get all active employees (for admin targeting UI)
  fastify.get(
    '/employees',
    { preHandler: [authorize(['admin', 'analyst', 'defender'])] },
    async () => {

      const employees = await Employee.find({ isActive: true })

      return employees

    }
  )

}

module.exports = orgRoutes