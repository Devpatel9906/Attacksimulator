const { authenticate } = require('../middleware/authenticate')
const { authorize } = require('../middleware/authorize')
const { getLiveScenario, flagCompromisedEmployee, getDefenderDashboard } = require('../controllers/defenderController')

async function defenderRoutes(fastify, opts) {
  fastify.addHook('onRequest', authenticate)

  fastify.get('/orgs/:orgId/defender/dashboard', { preHandler: [authorize(['admin', 'defender'])] }, getDefenderDashboard)
  fastify.get('/scenarios/:scenarioId/defender/live', { preHandler: [authorize(['admin', 'defender'])] }, getLiveScenario)
  fastify.post('/scenarios/:scenarioId/defender/flag/:employeeId', { preHandler: [authorize(['admin', 'defender'])] }, flagCompromisedEmployee)
}

module.exports = defenderRoutes