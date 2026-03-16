const mongoSanitize = require('mongo-sanitize')
const Scenario = require('../models/Scenario')
const GhostPersona = require('../models/GhostPersona')
const Employee = require('../models/Employee')
const SimulationEvent = require('../models/SimulationEvent')
const { terminateGhost } = require('../utils/ghostEngine')
const { emitGhostState, emitScenarioComplete } = require('../utils/socketManager')
const { createAuditLog } = require('../utils/auditLogger')

function actor(request) {
  return { actorId: request.user?.id, actorRole: request.user?.role, ipAddress: request.ip }
}

async function getLiveScenario(request, reply) {
  try {
    const { scenarioId } = request.params
    const scenario = await Scenario.findById(mongoSanitize(scenarioId))
      .populate('patientZero', 'firstName lastName role department displayName')

    if (!scenario) return reply.status(404).send({ error: 'Scenario not found' })

    const ghost = scenario.ghostPersonaId
      ? await GhostPersona.findById(scenario.ghostPersonaId)
          .populate('compromisedNodes', 'firstName lastName role department displayName behavioralArchetype')
          .populate('currentTarget', 'firstName lastName role displayName')
      : null

    const recentEvents = await SimulationEvent.find({ scenario: scenario._id })
      .populate('employee', 'firstName lastName role displayName department')
      .sort({ recordedAt: -1 })
      .limit(20)

    return reply.status(200).send({
      scenario: {
        id: scenario._id, name: scenario.name, status: scenario.status,
        ghostState: scenario.ghostState, compromisedCount: scenario.compromisedCount,
        reportedCount: scenario.reportedCount, clickedCount: scenario.clickedCount,
        financialExposure: scenario.financialExposure, totalHops: scenario.totalHops,
        startedAt: scenario.startedAt, patientZero: scenario.patientZero
      },
      ghost: ghost ? {
        id: ghost._id, state: ghost.state, aggressionLevel: ghost.aggressionLevel,
        currentTechnique: ghost.currentTechnique, currentTarget: ghost.currentTarget,
        compromisedNodes: ghost.compromisedNodes, techniqueHistory: ghost.techniqueHistory
      } : null,
      recentEvents: recentEvents.map(e => ({
        id: e._id, employee: e.employee, attackType: e.attackType,
        result: e.result, isGhostHop: e.isGhostHop, hopNumber: e.hopNumber,
        recordedAt: e.recordedAt
      }))
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function flagCompromisedEmployee(request, reply) {
  try {
    const { scenarioId, employeeId } = request.params

    const scenario = await Scenario.findById(mongoSanitize(scenarioId))
    if (!scenario) return reply.status(404).send({ error: 'Scenario not found' })
    if (scenario.status !== 'active') return reply.status(400).send({ error: 'Scenario not active' })

    const ghost = await GhostPersona.findById(scenario.ghostPersonaId)
    if (!ghost) return reply.status(404).send({ error: 'Ghost not found' })

    const isCompromised = ghost.compromisedNodes
      .map(id => id.toString())
      .includes(employeeId)

    if (isCompromised) {
      // Defender caught the ghost — terminate
      await terminateGhost(ghost._id.toString(), request.user.id)

      emitGhostState(scenarioId, { state: 'TERMINATED', terminatedBy: 'defender' })
      emitScenarioComplete(scenarioId, {
        outcome: 'defender_won',
        compromisedCount: scenario.compromisedCount,
        totalHops: scenario.totalHops
      })

      await createAuditLog({
        ...actor(request), action: 'defender.ghost_caught',
        outcome: 'SUCCESS',
        metadata: { scenarioId, employeeId, ghostId: ghost._id }
      })

      return reply.status(200).send({ caught: true, message: 'Ghost terminated. Defender wins.' })
    }

    return reply.status(200).send({ caught: false, message: 'Employee not currently compromised' })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function getDefenderDashboard(request, reply) {
  try {
    const { orgId } = request.params

    const activeScenarios = await Scenario.find({
      organization: mongoSanitize(orgId),
      status: 'active'
    }).populate('patientZero', 'firstName lastName role displayName')

    const compromisedEmployees = await Employee.find({
      organization: mongoSanitize(orgId),
      isCompromised: true
    }).populate('department', 'name').select('firstName lastName role displayName department behavioralArchetype')

    return reply.status(200).send({
      activeScenarios: activeScenarios.map(s => ({
        id: s._id, name: s.name, ghostState: s.ghostState,
        compromisedCount: s.compromisedCount, startedAt: s.startedAt,
        patientZero: s.patientZero
      })),
      compromisedEmployees,
      totalCompromised: compromisedEmployees.length
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

module.exports = { getLiveScenario, flagCompromisedEmployee, getDefenderDashboard }