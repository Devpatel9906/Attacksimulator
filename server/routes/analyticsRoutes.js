const Employee = require('../models/Employee')
const SimulationEvent = require('../models/SimulationEvent')

async function analyticsRoutes(fastify, opts) {

  fastify.get('/analytics/infection-map/:scenarioId', async (request, reply) => {

    const { scenarioId } = request.params

    const employees = await Employee.find()

    const events = await SimulationEvent.find({
      scenario: scenarioId
    })


    const nodes = employees.map(emp => {

      const event = events.find(e =>
        e.employee.toString() === emp._id.toString()
      )

      return {
        id: emp._id,
        label: emp.displayName,
        department: emp.department,
        infected: event ? event.result !== "pending" : false,
        hop: event ? event.hopNumber : 0
      }

    })


    const edges = []

for (const event of events) {

  if (!event.isGhostHop) continue

  const parent = events.find(e =>
    e.attackType === event.attackType &&
    e.hopNumber === event.hopNumber - 1
  )

  if (!parent) continue

  edges.push({
    from: parent.employee,
    to: event.employee,
    attackType: event.attackType
  })

}


    return {
      nodes,
      edges,
      totalNodes: nodes.length,
      totalEdges: edges.length
    }

  })

}

module.exports = analyticsRoutes