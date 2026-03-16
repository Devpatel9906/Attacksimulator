const { createAuditLog } = require('../utils/auditLogger')

const authenticate = async (req, reply) => {
  try {
    await req.jwtVerify()
  } catch (err) {
    await createAuditLog({
      action: 'UNAUTHORIZED_ACCESS',
      outcome: 'BLOCKED',
      metadata: {
        path: req.url,
        method: req.method,
        reason: err.message,
        ip: req.ip
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })
    return reply.status(401).send({
      error: 'Authentication required'
    })
  }
}

module.exports = { authenticate }
