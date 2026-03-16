const {
  register,
  login,
  logout,
  getMe
} = require('../controllers/authController')

const {
  employeeLogin
} = require('../controllers/employeeAuthController')

const {
  getMyProfile,
  getMyModules,
  getMyDebrief,
  getMyBadges
} = require('../controllers/employeeDashboardController')

const { authenticate } = require('../middleware/authenticate')
const { RateLimiterRedis } = require('rate-limiter-flexible')
const redis = require('../config/redis')

const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'auth_limit',
  points: 20, // Increased points to allow consecutive register -> login flows during testing
  duration: 900,
  blockDuration: 900
})

const authRateLimit = async (req, reply) => {
  try {
    await authLimiter.consume(req.ip)
  } catch {
    return reply.status(429).send({
      error: 'Too many attempts — try again in 15 minutes'
    })
  }
}

async function authRoutes(fastify) {

  // ───────── Admin / Analyst / Defender auth ─────────

  fastify.post(
    '/api/auth/register',
    { preHandler: [authRateLimit] },
    register
  )

  fastify.post(
    '/api/auth/login',
    { preHandler: [authRateLimit] },
    login
  )

  fastify.post(
    '/api/auth/logout',
    { preHandler: [authenticate] },
    logout
  )

  fastify.get(
    '/api/auth/me',
    { preHandler: [authenticate] },
    getMe
  )


  // ───────── Employee login ─────────

  fastify.post(
    '/api/auth/employee/login',
    { preHandler: [authRateLimit] },
    employeeLogin
  )


  // ───────── Employee dashboard ─────────

  fastify.get(
    '/api/me',
    { preHandler: [authenticate] },
    getMyProfile
  )

  fastify.get(
    '/api/me/modules',
    { preHandler: [authenticate] },
    getMyModules
  )

  fastify.get(
    '/api/me/debrief/:scenarioId',
    { preHandler: [authenticate] },
    getMyDebrief
  )

  fastify.get(
    '/api/me/badges',
    { preHandler: [authenticate] },
    getMyBadges
  )
}

module.exports = authRoutes