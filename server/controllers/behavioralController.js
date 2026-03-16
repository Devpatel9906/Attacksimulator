const mongoSanitize = require('mongo-sanitize')
const Employee = require('../models/Employee')
const SimulationEvent = require('../models/SimulationEvent')
const { updateEmployeeArchetype, updateOrgArchetypes, ARCHETYPE_RULES } = require('../utils/behavioralDNA')

async function getEmployeeDNA(request, reply) {
  try {
    const { employeeId } = request.params
    const employee = await Employee.findById(mongoSanitize(employeeId))
      .populate('department', 'name')
    if (!employee) return reply.status(404).send({ error: 'Employee not found' })

    const events = await SimulationEvent.find({ employee: employeeId }).sort({ recordedAt: -1 })
    const archetype = await updateEmployeeArchetype(employeeId)

    const total = events.length
    const clicked = events.filter(e => ['clicked', 'submitted_form'].includes(e.result)).length
    const reported = events.filter(e => e.result === 'reported').length

    return reply.status(200).send({
      employee: {
        id: employee._id, displayName: employee.displayName,
        role: employee.role, department: employee.department,
        behavioralArchetype: archetype,
        securityScore: employee.securityScore
      },
      stats: {
        totalEvents: total,
        clickRate: total > 0 ? Math.round((clicked / total) * 100) : 0,
        reportRate: total > 0 ? Math.round((reported / total) * 100) : 0,
        scenariosCompleted: employee.scenariosCompleted,
        scenariosFailed: employee.scenariosFailed
      },
      archetypeDescription: ARCHETYPE_RULES[archetype]?.description || 'Insufficient data'
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function getOrgDNA(request, reply) {
  try {
    const { orgId } = request.params
    const results = await updateOrgArchetypes(mongoSanitize(orgId))

    const summary = { rushed_responder: 0, trusting_delegator: 0, distracted_clicker: 0, skeptical_verifier: 0, unknown: 0 }
    for (const r of results) summary[r.archetype] = (summary[r.archetype] || 0) + 1

    return reply.status(200).send({ orgId, total: results.length, archetypeBreakdown: summary, employees: results })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

module.exports = { getEmployeeDNA, getOrgDNA }