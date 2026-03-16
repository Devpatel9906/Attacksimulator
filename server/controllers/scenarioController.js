const mongoSanitize = require('mongo-sanitize')
const { z } = require('zod')

const Scenario = require('../models/Scenario')
const Employee = require('../models/Employee')
const Department = require('../models/Department')
const Organization = require('../models/Organization')

const { createAuditLog } = require('../utils/auditLogger')
const { executeWave1 } = require('../utils/waveExecutor')

const CreateScenarioSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  organizationId: z.string().min(1),

  attackTypes: z.array(
    z.enum([
      'email_phishing',
      'credential_harvesting',
      'social_engineering',
      'malware_simulation',
      'sim_swap',
      'fileless_malware',
      'watering_hole',
      'bec',
      'ai_deepfake',
      'supply_chain'
    ])
  ).min(1),

  targetDepartments: z.array(z.string()).optional(),

  difficulty: z.enum([
    'level_1',
    'level_2',
    'level_3',
    'level_4',
    'level_5'
  ]).default('level_1')
})

function getUserId(request) {
  return request.user?.userId || request.user?.id || request.user?._id || null
}

function actor(request) {
  return {
    actorId: getUserId(request),
    actorRole: request.user?.role,
    ipAddress: request.ip
  }
}

async function createScenario(request, reply) {
  try {

    const body = mongoSanitize(request.body)
    const validated = CreateScenarioSchema.parse(body)

    const userId = getUserId(request)

    if (!userId)
      return reply.status(401).send({ error: 'Authentication required' })

    const org = await Organization.findById(validated.organizationId)

    if (!org)
      return reply.status(404).send({ error: 'Organization not found' })

    const scenario = new Scenario({
      name: validated.name,
      organization: org._id,
      createdBy: userId,
      attackTypes: validated.attackTypes,
      targetDepartments: validated.targetDepartments || [],
      difficulty: validated.difficulty
    })

    await scenario.save()

    await createAuditLog({
      ...actor(request),
      action: 'scenario.create',
      outcome: 'SUCCESS',
      metadata: {
        scenarioId: scenario._id,
        orgId: org._id
      }
    })

    return reply.status(201).send({
      scenario: {
        id: scenario._id,
        name: scenario.name,
        status: scenario.status,
        attackTypes: scenario.attackTypes,
        difficulty: scenario.difficulty,
        organizationId: org._id,
        createdAt: scenario.createdAt
      }
    })

  } catch (err) {

    if (err.name === 'ZodError')
      return reply.status(400).send({
        error: 'Validation failed',
        details: err.errors
      })

    request.log.error(err)

    return reply.status(500).send({
      error: 'Internal server error'
    })
  }
}

async function getScenario(request, reply) {
  try {

    const scenario = await Scenario
      .findById(mongoSanitize(request.params.scenarioId))
      .populate('targetDepartments', 'name')
      .populate('patientZero', 'firstName lastName role displayName')

    if (!scenario)
      return reply.status(404).send({ error: 'Scenario not found' })

    return reply.status(200).send({ scenario })

  } catch (err) {

    request.log.error(err)

    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function listScenarios(request, reply) {
  try {

    const { orgId } = request.params
    const { status, page = 1, limit = 20 } = request.query

    const filter = { organization: mongoSanitize(orgId) }

    if (status)
      filter.status = mongoSanitize(status)

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const scenarios = await Scenario
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Scenario.countDocuments(filter)

    return reply.status(200).send({
      scenarios: scenarios.map(s => ({
        id: s._id,
        name: s.name,
        status: s.status,
        attackTypes: s.attackTypes,
        difficulty: s.difficulty,
        ghostState: s.ghostState,
        compromisedCount: s.compromisedCount,
        reportedCount: s.reportedCount,
        financialExposure: s.financialExposure,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        createdAt: s.createdAt
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

async function launchScenario(request, reply) {
  try {

    const scenarioId = mongoSanitize(request.params.scenarioId)

    const scenario = await Scenario.findById(scenarioId)

    if (!scenario)
      return reply.status(404).send({ error: 'Scenario not found' })

    if (scenario.status !== 'draft')
      return reply.status(400).send({ error: 'Scenario already launched' })

    const filter = {
      organization: scenario.organization,
      isActive: true
    }

    if (Array.isArray(scenario.targetDepartments) && scenario.targetDepartments.length > 0) {
      filter.department = { $in: scenario.targetDepartments }
    }

    const employees = await Employee.find(filter)

    if (!employees || employees.length === 0)
      return reply.status(400).send({ error: 'No employees found for this scenario' })

    scenario.targetEmployees = employees.map(e => e._id)
    scenario.status = 'active'
    scenario.startedAt = new Date()

    await scenario.save()

    // NEW: Actually execute the attack wave to send the emails
    const waveResult = await executeWave1(scenario._id)

    await createAuditLog({
      ...actor(request),
      action: 'scenario.launch',
      outcome: 'SUCCESS',
      metadata: {
        scenarioId: scenario._id,
        targetCount: employees.length
      }
    })

    return reply.status(200).send({
      message: 'Scenario launched',
      scenarioId: scenario._id,
      targetCount: employees.length,
      status: scenario.status
    })

  } catch (err) {

    request.log.error(err)

    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function terminateScenario(request, reply) {
  try {

    const scenario = await Scenario.findById(
      mongoSanitize(request.params.scenarioId)
    )

    if (!scenario)
      return reply.status(404).send({ error: 'Scenario not found' })

    if (scenario.status !== 'active')
      return reply.status(400).send({ error: 'Scenario is not active' })

    scenario.status = 'terminated'
    scenario.ghostState = 'TERMINATED'
    scenario.completedAt = new Date()
    scenario.terminationReason =
      mongoSanitize(request.body?.reason) || 'manual_termination'

    await scenario.save()

    await createAuditLog({
      ...actor(request),
      action: 'scenario.terminate',
      outcome: 'SUCCESS',
      metadata: {
        scenarioId: scenario._id,
        reason: scenario.terminationReason
      }
    })

    return reply.status(200).send({
      message: 'Scenario terminated',
      scenarioId: scenario._id
    })

  } catch (err) {

    request.log.error(err)

    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function getInfectionMap(request, reply) {
  try {

    const scenario = await Scenario.findById(
      mongoSanitize(request.params.scenarioId)
    )

    if (!scenario)
      return reply.status(404).send({ error: 'Scenario not found' })

    const employees = await Employee
      .find({
        organization: scenario.organization,
        isActive: true
      })
      .populate('department', 'name')

    const nodes = employees.map(e => ({
      id: e._id,
      name: e.displayName,
      department: e.department?.name,
      role: e.role,
      compromised: e.isCompromised
    }))

    return reply.status(200).send({
      scenarioId: scenario._id,
      totalEmployees: nodes.length,
      nodes
    })

  } catch (err) {

    request.log.error(err)

    return reply.status(500).send({ error: 'Internal server error' })
  }
}

module.exports = {
  createScenario,
  getScenario,
  listScenarios,
  launchScenario,
  terminateScenario,
  getInfectionMap
}