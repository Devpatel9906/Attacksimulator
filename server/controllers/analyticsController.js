const mongoSanitize = require('mongo-sanitize')
const Scenario = require('../models/Scenario')
const SimulationEvent = require('../models/SimulationEvent')
const Employee = require('../models/Employee')
const Department = require('../models/Department')
const Organization = require('../models/Organization')
const GhostPersona = require('../models/GhostPersona')
const { calculateExposure, calculateROI, calculateInsuranceGap } = require('../utils/financialCalculator')
const { createAuditLog } = require('../utils/auditLogger')

function actor(request) {
  return { actorId: request.user?.id, actorRole: request.user?.role, ipAddress: request.ip }
}

async function getOrgDashboard(request, reply) {
  try {
    const { orgId } = request.params
    const org = await Organization.findById(mongoSanitize(orgId))
    if (!org) return reply.status(404).send({ error: 'Organization not found' })

    const [totalEmployees, compromisedEmployees, totalScenarios, activeScenarios, departments] = await Promise.all([
      Employee.countDocuments({ organization: orgId, isActive: true }),
      Employee.countDocuments({ organization: orgId, isCompromised: true }),
      Scenario.countDocuments({ organization: orgId }),
      Scenario.countDocuments({ organization: orgId, status: 'active' }),
      Department.find({ organization: orgId })
    ])

    const recentScenarios = await Scenario.find({ organization: orgId })
      .sort({ createdAt: -1 }).limit(5)

    const allEvents = await SimulationEvent.find({ organization: orgId })
    const clickedEvents = allEvents.filter(e => ['clicked', 'submitted_form', 'downloaded'].includes(e.result))
    const reportedEvents = allEvents.filter(e => e.result === 'reported')
    const clickRate = allEvents.length > 0 ? Math.round((clickedEvents.length / allEvents.length) * 100) : 0
    const reportRate = allEvents.length > 0 ? Math.round((reportedEvents.length / allEvents.length) * 100) : 0

    await createAuditLog({ ...actor(request), action: 'analytics.dashboard', outcome: 'SUCCESS', metadata: { orgId } })

    return reply.status(200).send({
      overview: {
        totalEmployees, compromisedEmployees, totalScenarios,
        activeScenarios, clickRate, reportRate,
        securityCultureScore: org.securityCultureScore
      },
      departments: departments.map(d => ({
        id: d._id, name: d.name, employeeCount: d.employeeCount,
        riskScore: d.riskScore, departmentSecurityScore: d.departmentSecurityScore
      })),
      recentScenarios: recentScenarios.map(s => ({
        id: s._id, name: s.name, status: s.status,
        compromisedCount: s.compromisedCount, reportedCount: s.reportedCount,
        financialExposure: s.financialExposure, createdAt: s.createdAt
      }))
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function getScenarioAnalytics(request, reply) {
  try {
    const { scenarioId } = request.params
    const scenario = await Scenario.findById(mongoSanitize(scenarioId))
    if (!scenario) return reply.status(404).send({ error: 'Scenario not found' })

    const org = await Organization.findById(scenario.organization)
    const events = await SimulationEvent.find({ scenario: scenarioId })
      .populate('employee', 'firstName lastName role displayName department behavioralArchetype roleSensitivityWeight')

    const compromisedEmployees = await Employee.find({
      _id: { $in: events.filter(e => ['clicked', 'submitted_form'].includes(e.result)).map(e => e.employee._id) }
    })

    const exposure = calculateExposure({
      compromisedEmployees,
      attackTypes: scenario.attackTypes,
      industry: org.industry
    })

    // Update scenario financial exposure
    await Scenario.findByIdAndUpdate(scenarioId, { financialExposure: exposure.totalExposure })

    const byAttackType = {}
    for (const event of events) {
      if (!byAttackType[event.attackType]) byAttackType[event.attackType] = { total: 0, clicked: 0, reported: 0, ignored: 0 }
      byAttackType[event.attackType].total++
      if (['clicked', 'submitted_form', 'downloaded'].includes(event.result)) byAttackType[event.attackType].clicked++
      if (event.result === 'reported') byAttackType[event.attackType].reported++
      if (event.result === 'ignored') byAttackType[event.attackType].ignored++
    }

    const byDepartment = {}
    for (const event of events) {
      const deptId = event.employee?.department?.toString()
      if (!deptId) continue
      if (!byDepartment[deptId]) byDepartment[deptId] = { total: 0, clicked: 0, reported: 0 }
      byDepartment[deptId].total++
      if (['clicked', 'submitted_form'].includes(event.result)) byDepartment[deptId].clicked++
      if (event.result === 'reported') byDepartment[deptId].reported++
    }

    return reply.status(200).send({
      scenario: {
        id: scenario._id, name: scenario.name, status: scenario.status,
        ghostState: scenario.ghostState, totalHops: scenario.totalHops,
        compromisedCount: scenario.compromisedCount, reportedCount: scenario.reportedCount
      },
      financial: exposure,
      byAttackType,
      byDepartment,
      events: events.map(e => ({
        id: e._id,
        employee: e.employee,
        attackType: e.attackType,
        result: e.result,
        isGhostHop: e.isGhostHop,
        hopNumber: e.hopNumber,
        timeToActionSeconds: e.timeToActionSeconds,
        recordedAt: e.recordedAt
      }))
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function getFinancialRisk(request, reply) {
  try {
    const { orgId } = request.params
    const { insuranceLimit = 2000000 } = request.query

    const org = await Organization.findById(mongoSanitize(orgId))
    if (!org) return reply.status(404).send({ error: 'Organization not found' })

    const compromisedEmployees = await Employee.find({ organization: orgId, isCompromised: true })
    const scenarios = await Scenario.find({ organization: orgId, status: { $in: ['active', 'completed'] } })
    const attackTypes = [...new Set(scenarios.flatMap(s => s.attackTypes))]

    const exposure = calculateExposure({ compromisedEmployees, attackTypes: attackTypes.length > 0 ? attackTypes : ['email_phishing'], industry: org.industry })
    const insuranceGap = calculateInsuranceGap({ totalExposure: exposure.totalExposure, insuranceLimit: parseInt(insuranceLimit) })

    return reply.status(200).send({
      organization: { id: org._id, name: org.name, industry: org.industry },
      financial: { ...exposure, ...insuranceGap },
      compromisedCount: compromisedEmployees.length
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function getKillChain(request, reply) {
  try {
    const { scenarioId } = request.params
    const scenario = await Scenario.findById(mongoSanitize(scenarioId))
      .populate('patientZero', 'firstName lastName role displayName department')
    if (!scenario) return reply.status(404).send({ error: 'Scenario not found' })

    const ghost = await GhostPersona.findById(scenario.ghostPersonaId)
    const events = await SimulationEvent.find({ scenario: scenarioId, isGhostHop: true })
      .populate('employee', 'firstName lastName role displayName department behavioralArchetype')
      .sort({ hopNumber: 1 })

    const chain = events.map((e, i) => ({
      hop: e.hopNumber,
      employee: e.employee,
      technique: ghost?.techniqueHistory[i] || 'unknown',
      result: e.result,
      recordedAt: e.recordedAt
    }))

    return reply.status(200).send({
      scenarioId, patientZero: scenario.patientZero,
      chain, totalHops: chain.length,
      outcome: scenario.terminationReason,
      ghostState: scenario.ghostState
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

module.exports = { getOrgDashboard, getScenarioAnalytics, getFinancialRisk, getKillChain }