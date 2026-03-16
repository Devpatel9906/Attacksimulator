const { createAuditLog } = require('../utils/auditLogger')

const authorize = (allowedRoles) => {
  return async (req, reply) => {

    if (!req.user) {
      return reply.status(401).send({
        error: 'Authentication required'
      })
    }

    if (!allowedRoles.includes(req.user.role)) {

      await createAuditLog({
        action: 'AUTHORIZATION_FAILED',
        actorId: req.user.id,
        actorRole: req.user.role,
        outcome: 'BLOCKED',
        metadata: {
          path: req.url,
          method: req.method,
          requiredRoles: allowedRoles,
          userRole: req.user.role,
          ip: req.ip
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      })

      return reply.status(403).send({
        error: 'You do not have permission to perform this action'
      })
    }

  }
}

module.exports = { authorize }