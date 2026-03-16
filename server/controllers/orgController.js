const mongoSanitize = require('mongo-sanitize')
const Employee = require('../models/Employee')
const Organization = require('../models/Organization')
const Department = require('../models/Department')


/* CREATE ORGANIZATION */

async function createOrganization(request, reply) {
  try {

    const org = new Organization({
      name: request.body.name
    })

    await org.save()

    return reply.status(201).send({ organization: org })

  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}


/* GET ORGANIZATION */

async function getOrganization(request, reply) {
  try {

    const org = await Organization.findById(
      mongoSanitize(request.params.orgId)
    )

    if (!org)
      return reply.status(404).send({ error: 'Organization not found' })

    return reply.send({ organization: org })

  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}


/* ADD DEPARTMENT */

async function addDepartment(request, reply) {
  try {

    const dept = new Department({
      name: request.body.name,
      organization: mongoSanitize(request.params.orgId)
    })

    await dept.save()

    return reply.status(201).send({ department: dept })

  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}


/* GET DEPARTMENTS */

async function getDepartments(request, reply) {
  try {

    const departments = await Department.find({
      organization: mongoSanitize(request.params.orgId)
    })

    return reply.send({ departments })

  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}


/* ADD EMPLOYEE */

async function addEmployee(request, reply) {
  try {

    const employee = new Employee({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      role: request.body.role,
      department: request.body.department,
      organization: mongoSanitize(request.params.orgId)
    })

    Employee.setEmail(employee, request.body.email)

    await employee.save()

    return reply.status(201).send({ employee })

  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}


/* BULK UPLOAD EMPLOYEES */

async function bulkUploadEmployees(request, reply) {
  return reply.send({ message: "Bulk upload not implemented yet" })
}


/* GET EMPLOYEES */

async function getEmployees(request, reply) {
  try {

    const { departmentId, archetype, role, page = 1, limit = 50 } = request.query

    const filter = {
      organization: mongoSanitize(request.params.orgId),
      isActive: true
    }

    if (departmentId) filter.department = mongoSanitize(departmentId)
    if (archetype) filter.behavioralArchetype = mongoSanitize(archetype)
    if (role) filter.role = mongoSanitize(role)

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const employees = await Employee.find(filter)
      .populate('department', 'name')
      .sort({ lastName: 1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Employee.countDocuments(filter)

    return reply.status(200).send({
      employees: employees.map(e => ({
        id: e._id,
        firstName: e.firstName,
        lastName: e.lastName,
        displayName: e.displayName,
        role: e.role,
        department: e.department,
        behavioralArchetype: e.behavioralArchetype,
        securityScore: e.securityScore,
        scenariosCompleted: e.scenariosCompleted,
        scenariosFailed: e.scenariosFailed,
        isCompromised: e.isCompromised,
        roleSensitivityWeight: e.roleSensitivityWeight
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })

  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}


/* GET EMPLOYEE */

async function getEmployee(request, reply) {
  try {

    const emp = await Employee.findOne({
      _id: mongoSanitize(request.params.employeeId),
      organization: mongoSanitize(request.params.orgId)
    }).populate('department', 'name')

    if (!emp)
      return reply.status(404).send({ error: 'Employee not found' })

    return reply.status(200).send({
      employee: {
        id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        displayName: emp.displayName,
        role: emp.role,
        department: emp.department,
        behavioralArchetype: emp.behavioralArchetype,
        securityScore: emp.securityScore,
        scenariosCompleted: emp.scenariosCompleted,
        scenariosFailed: emp.scenariosFailed,
        awarModulesCompleted: emp.awarModulesCompleted,
        badges: emp.badges,
        isCompromised: emp.isCompromised,
        roleSensitivityWeight: emp.roleSensitivityWeight,
        lastSimulationResult: emp.lastSimulationResult,
        createdAt: emp.createdAt
      }
    })

  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}


/* UPDATE SECURITY CULTURE SCORE */

async function updateOrgSecurityCultureScore(orgId) {

  const employees = await Employee.find({
    organization: orgId,
    isActive: true
  })

  if (employees.length === 0) return

  const total = employees.length

  const reported = employees.filter(
    e => e.lastSimulationResult === 'reported'
  ).length

  const reportRate = (reported / total) * 100

  const completionRate =
    (employees.reduce((sum, e) => sum + e.awarModulesCompleted, 0) / (total * 5)) * 100

  const avgScore =
    employees.reduce((sum, e) => sum + e.securityScore, 0) / total

  const score =
    reportRate * 0.3 +
    Math.min(completionRate, 100) * 0.2 +
    avgScore * 0.5

  await Organization.findByIdAndUpdate(orgId, {
    securityCultureScore: Math.round(score),
    'securityCultureBreakdown.reportRate': Math.round(reportRate),
    'securityCultureBreakdown.moduleCompletion': Math.round(completionRate)
  })
}


/* EXPORTS */

module.exports = {
  createOrganization,
  getOrganization,
  addDepartment,
  getDepartments,
  addEmployee,
  getEmployees,
  getEmployee,
  bulkUploadEmployees,
  updateOrgSecurityCultureScore
}