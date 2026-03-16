const { employeeLogin, employeeLogout, setPassword } = require('../controllers/employeeAuthController')
const { RateLimiterMemory } = require('rate-limiter-flexible')

const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60
})

async function employeeAuthRoutes(fastify) {

  // Employee login
  fastify.post('/employee/login', async (request, reply) => {
    try {
      await loginLimiter.consume(request.ip)
    } catch {
      return reply.status(429).send({
        error: 'Too many login attempts. Try again in 1 minute.'
      })
    }

    return employeeLogin(request, reply)
  })

  fastify.post('/employee/logout', employeeLogout)

  fastify.post('/employee/set-password', setPassword)

}

module.exports = employeeAuthRoutes