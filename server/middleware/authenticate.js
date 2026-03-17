const { createAuditLog } = require('../utils/auditLogger')

const authenticate = async (req, reply) => {
  try {
    // Debug logging for production auth troubleshooting
    const hasTokenCookie = !!req.cookies?.token;
    if (!hasTokenCookie) {
      req.log.warn({ 
        url: req.url, 
        cookiesPresent: Object.keys(req.cookies || {}),
        msg: "No token cookie found in request" 
      });
    }

    await req.jwtVerify()
  } catch (err) {
    req.log.error({
      url: req.url,
      reason: err.message,
      stack: err.stack,
      msg: "JWT Verification failed"
    });
    
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
