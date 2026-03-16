const Employee = require('../models/Employee')
const SimulationEvent = require('../models/SimulationEvent')

const ARCHETYPE_RULES = {
  rushed_responder: {
    condition: (stats) => stats.avgTimeToAction < 15 && stats.clickRate > 0.5,
    description: 'Clicks within 15 seconds, high click rate, peak risk 9-10am'
  },
  trusting_delegator: {
    condition: (stats) => stats.submitRate > 0.4 && stats.internalClickRate > 0.6,
    description: 'Submits credentials when email appears internal'
  },
  distracted_clicker: {
    condition: (stats) => stats.clickRate > 0.5 && stats.submitRate < 0.2,
    description: 'Clicks links but rarely submits'
  },
  skeptical_verifier: {
    condition: (stats) => stats.reportRate > 0.5,
    description: 'Reports suspicious emails, security champion candidate'
  }
}

async function computeArchetype(employeeId) {
  const events = await SimulationEvent.find({ employee: employeeId })
  if (events.length === 0) return 'unknown'

  const total = events.length
  const clicked = events.filter(e => ['clicked', 'submitted_form', 'downloaded'].includes(e.result)).length
  const submitted = events.filter(e => e.result === 'submitted_form').length
  const reported = events.filter(e => e.result === 'reported').length
  const timings = events.filter(e => e.timeToActionSeconds).map(e => e.timeToActionSeconds)
  const avgTime = timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 999

  const stats = {
    clickRate: clicked / total,
    submitRate: submitted / total,
    reportRate: reported / total,
    avgTimeToAction: avgTime,
    internalClickRate: clicked / total
  }

  // Check archetypes in priority order
  if (ARCHETYPE_RULES.skeptical_verifier.condition(stats)) return 'skeptical_verifier'
  if (ARCHETYPE_RULES.rushed_responder.condition(stats)) return 'rushed_responder'
  if (ARCHETYPE_RULES.trusting_delegator.condition(stats)) return 'trusting_delegator'
  if (ARCHETYPE_RULES.distracted_clicker.condition(stats)) return 'distracted_clicker'

  return 'unknown'
}

async function updateEmployeeArchetype(employeeId) {
  const archetype = await computeArchetype(employeeId)
  await Employee.findByIdAndUpdate(employeeId, { behavioralArchetype: archetype })
  return archetype
}

async function updateOrgArchetypes(orgId) {
  const employees = await Employee.find({ organization: orgId, isActive: true }).select('_id')
  const results = []
  for (const emp of employees) {
    const archetype = await updateEmployeeArchetype(emp._id)
    results.push({ employeeId: emp._id, archetype })
  }
  return results
}

module.exports = { computeArchetype, updateEmployeeArchetype, updateOrgArchetypes, ARCHETYPE_RULES }