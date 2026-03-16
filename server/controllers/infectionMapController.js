const SimulationEvent = require('../models/SimulationEvent')

async function getInfectionMap(req, reply) {

  const { scenarioId } = req.params

  const events = await SimulationEvent.find({
    scenario: scenarioId
  })
  .sort({ createdAt: 1 })
  .populate('employee','displayName department')

  const nodes = []
  const edges = []

  const seen = new Set()
  const eventMap = {}

  for (const ev of events) {

    if (!ev.employee) continue

    const empId = ev.employee._id.toString()

    eventMap[ev._id.toString()] = ev

    if (!seen.has(empId)) {

      nodes.push({
        id: empId,
        label: ev.employee.displayName,
        department: ev.employee.department,
        infected: ev.result !== "pending",
        hop: ev.hopNumber || 0
      })

      seen.add(empId)

    }

  }

  for (const ev of events) {

    if (!ev.isGhostHop) continue

    const parent = events.find(
      e =>
        e.employee &&
        e.hopNumber === ev.hopNumber - 1 &&
        e.scenario.toString() === scenarioId
    )

    if (parent && parent.employee) {

      edges.push({
        from: parent.employee._id.toString(),
        to: ev.employee._id.toString(),
        attackType: ev.attackType
      })

    }

  }

  return reply.send({
    nodes,
    edges,
    totalNodes: nodes.length,
    totalEdges: edges.length
  })

}

module.exports = {
  getInfectionMap
}