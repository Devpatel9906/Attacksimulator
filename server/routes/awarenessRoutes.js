const { authenticate } = require('../middleware/authenticate')
const { authorize } = require('../middleware/authorize')
const { getEmployeeModules, getModule, submitQuiz, getLeaderboard } = require('../controllers/awarenessController')

async function awarenessRoutes(fastify, opts) {
  fastify.addHook('onRequest', authenticate)

  fastify.get('/employees/:employeeId/modules', { preHandler: [authorize(['admin', 'analyst', 'defender'])] }, getEmployeeModules)
  fastify.get('/modules/:moduleId', { preHandler: [authorize(['admin', 'analyst', 'defender'])] }, getModule)
  fastify.post('/modules/:moduleId/quiz', { preHandler: [authorize(['admin', 'analyst', 'defender'])] }, submitQuiz)
  fastify.get('/orgs/:orgId/leaderboard', { preHandler: [authorize(['admin', 'analyst', 'defender'])] }, getLeaderboard)
}

module.exports = awarenessRoutes