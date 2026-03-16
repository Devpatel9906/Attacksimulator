const { authenticate } = require('../middleware/authenticate')
const { authorize } = require('../middleware/authorize')
const { spawnGhostHandler, executeHopHandler, terminateGhostHandler, getGhostStatus } = require('../controllers/ghostController')

async function ghostRoutes(fastify, opts) {
  fastify.addHook('onRequest', authenticate)

  fastify.post('/scenarios/:scenarioId/ghost/spawn', { preHandler: [authorize(['admin'])] }, spawnGhostHandler)
  fastify.post('/ghost/:ghostId/hop', { preHandler: [authorize(['admin'])] }, executeHopHandler)
  fastify.post('/ghost/:ghostId/terminate', { preHandler: [authorize(['admin', 'defender'])] }, terminateGhostHandler)
  fastify.get('/ghost/:ghostId/status', { preHandler: [authorize(['admin', 'analyst', 'defender'])] }, getGhostStatus)
}

module.exports = ghostRoutes