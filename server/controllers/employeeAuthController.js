const mongoSanitize = require('mongo-sanitize')
const argon2 = require('argon2')
const Employee = require('../models/Employee')
const { createAuditLog } = require('../utils/auditLogger')
const { employeeLoginSchema } = require('../validators/employeeAuthValidator')
const crypto = require('crypto')

// Dummy hash for timing attack prevention
const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$dummy$dummyhashfortimingattackprevention'

async function employeeLogin(request, reply) {
  try {
    const body = mongoSanitize(request.body)
    const validated = employeeLoginSchema.parse(body)

    const employee = await Employee.findByEmail(validated.email)

    // Always hash even if employee not found — timing attack prevention
    if (!employee) {
      await argon2.verify(DUMMY_HASH, validated.password).catch(() => {})
      return reply.status(401).send({ error: 'Invalid email or password' })
    }

    if (!employee.passwordHash) {
      return reply.status(401).send({ error: 'Account not yet activated. Contact your administrator.' })
    }

    if (employee.isLocked()) {
      return reply.status(423).send({ error: 'Account temporarily locked. Try again in 15 minutes.' })
    }

    const valid = await employee.verifyPassword(validated.password)
    if (!valid) {
      await employee.incrementFailedAttempts()
      await createAuditLog({
        actorId: employee._id, actorRole: 'employee',
        action: 'employee.login.failed',
        outcome: 'FAILED',
        metadata: { employeeId: employee._id, ip: request.ip }
      })
      return reply.status(401).send({ error: 'Invalid email or password' })
    }

    await employee.resetFailedAttempts()

    const token = request.server.jwt.sign({
      userId: employee._id,
      role: 'employee',
      organizationId: employee.organization,
      employeeId: employee._id
    })

    reply.setCookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8 // 8 hours
    })

    await createAuditLog({
      actorId: employee._id, actorRole: 'employee',
      action: 'employee.login',
      outcome: 'SUCCESS',
      metadata: { employeeId: employee._id, ip: request.ip }
    })

    return reply.status(200).send({
      user: {
        id: employee._id,
        displayName: employee.displayName,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: 'employee',
        organizationId: employee.organization,
        employeeId: employee._id,
        securityScore: employee.securityScore,
        behavioralArchetype: employee.behavioralArchetype
      }
    })
  } catch (err) {
    if (err.name === 'ZodError') return reply.status(400).send({ error: 'Validation failed', details: err.errors })
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function employeeLogout(request, reply) {
  reply.clearCookie('token', { path: '/' })
  return reply.status(200).send({ message: 'Logged out successfully' })
}

async function generateSetPasswordToken(employeeId) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  await Employee.findByIdAndUpdate(employeeId, {
    passwordResetToken: token,
    passwordResetExpiry: expiry
  })
  return token
}

async function setPassword(request, reply) {
  try {
    const body = mongoSanitize(request.body)
    const { token, password } = body

    if (!token || !password) return reply.status(400).send({ error: 'Token and password required' })
    if (password.length < 8) return reply.status(400).send({ error: 'Password must be at least 8 characters' })

    const employee = await Employee.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() }
    })

    if (!employee) return reply.status(400).send({ error: 'Invalid or expired token' })

    await employee.setPassword(password)
    employee.passwordResetToken = null
    employee.passwordResetExpiry = null
    await employee.save()

    await createAuditLog({
      actorId: employee._id, actorRole: 'employee',
      action: 'employee.password_set',
      outcome: 'SUCCESS',
      metadata: { employeeId: employee._id }
    })

    return reply.status(200).send({ message: 'Password set successfully. You can now log in.' })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

module.exports = { employeeLogin, employeeLogout, setPassword, generateSetPasswordToken }