const { sendManualAttack } = require('../controllers/adminAttackController')

async function adminAttackRoutes(fastify, opts) {

  fastify.post('/admin/attack/send', sendManualAttack)

}

module.exports = adminAttackRoutes