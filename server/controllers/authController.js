const argon2 = require('argon2')
const mongoSanitize = require('mongo-sanitize')
const User = require('../models/User')
const { registerSchema, loginSchema } = require('../validators/authValidator')
const { createAuditLog } = require('../utils/auditLogger')

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1
}

// ───────────────── REGISTER ─────────────────

const register = async (req, reply) => {
  try {

    const sanitized = mongoSanitize(req.body)

    const result = registerSchema.safeParse(sanitized)

    if (!result.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: result.error.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      })
    }

    const { name, email, password, role, organizationId } = result.data

    const existing = await User.findByEmail(email)

    if (existing) {
      await createAuditLog({
        action: 'USER_REGISTER_FAILED',
        outcome: 'FAILED',
        metadata: { reason: 'email_exists', ip: req.ip },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      })

      return reply.status(409).send({
        error: 'Registration failed — please check your details'
      })
    }

    const hashedPassword = await argon2.hash(password, ARGON2_OPTIONS)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      organization: organizationId || null
    })

    await createAuditLog({
      action: 'USER_REGISTERED',
      actorId: user._id,
      actorRole: user.role,
      outcome: 'SUCCESS',
      metadata: {
        name: user.name,
        role: user.role
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })

    return reply.status(201).send({
      message: 'Registration successful'
    })

  } catch (err) {
    req.log.error(err)

    return reply.status(500).send({
      error: 'Internal server error'
    })
  }
}

// ───────────────── LOGIN ─────────────────

const login = async (req, reply) => {
  try {

    const sanitized = mongoSanitize(req.body)

    const result = loginSchema.safeParse(sanitized)

    if (!result.success) {
      return reply.status(400).send({
        error: 'Invalid credentials'
      })
    }

    const { email, password } = result.data

    const genericError = { error: 'Invalid email or password' }

    const user = await User.findByEmail(email)

    if (!user) {

      await createAuditLog({
        action: 'LOGIN_FAILED',
        outcome: 'FAILED',
        metadata: {
          reason: 'user_not_found',
          ip: req.ip
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      })

      // fake hash to prevent timing attack
      await argon2.hash(password, ARGON2_OPTIONS)

      return reply.status(401).send(genericError)
    }

    if (user.isLocked()) {

      await createAuditLog({
        action: 'LOGIN_FAILED',
        actorId: user._id,
        outcome: 'BLOCKED',
        metadata: {
          reason: 'account_locked',
          lockedUntil: user.lockedUntil,
          ip: req.ip
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      })

      return reply.status(423).send({
        error: 'Account temporarily locked — try again in 15 minutes'
      })
    }

    if (!user.isActive) {
      return reply.status(403).send({
        error: 'Account disabled — contact your administrator'
      })
    }

    const passwordValid = await argon2.verify(user.password, password)

    if (!passwordValid) {

      await user.incrementFailedAttempts()

      await createAuditLog({
        action: 'LOGIN_FAILED',
        actorId: user._id,
        outcome: 'FAILED',
        metadata: {
          reason: 'wrong_password',
          failedAttempts: user.failedLoginAttempts,
          ip: req.ip
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      })

      return reply.status(401).send(genericError)
    }

    await user.resetFailedAttempts()

    const token = req.server.jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        organizationId: user.organization?.toString() || null
      },
      { expiresIn: '8h' }
    )

    reply.setCookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 60 * 60
    })

    await createAuditLog({
      action: 'LOGIN_SUCCESS',
      actorId: user._id,
      actorRole: user.role,
      outcome: 'SUCCESS',
      metadata: {
        ip: req.ip,
        device: req.headers['user-agent']?.substring(0, 100)
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })

    return reply.send({
      user: {
        id: user._id,
        name: user.name,
        email: user.getEmail(),
        role: user.role,
        organizationId: user.organization
      }
    })

  } catch (err) {

    req.log.error(err)

    return reply.status(500).send({
      error: 'Internal server error'
    })
  }
}

// ───────────────── LOGOUT ─────────────────

const logout = async (req, reply) => {

  const userId = req.user?.userId || null

  reply.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })

  await createAuditLog({
    action: 'LOGOUT',
    actorId: userId,
    outcome: 'SUCCESS',
    metadata: { ip: req.ip },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  })

  return reply.send({
    message: 'Logged out successfully'
  })
}

// ───────────────── GET ME ─────────────────

const getMe = async (req, reply) => {

  const user = await User
    .findById(req.user.userId)
    .select('-password -failedLoginAttempts -lockedUntil')

  if (!user) {
    return reply.status(404).send({
      error: 'User not found'
    })
  }

  return reply.send({
    user: {
      id: user._id,
      name: user.name,
      email: user.getEmail(),
      role: user.role,
      organizationId: user.organization,
      lastLoginAt: user.lastLoginAt
    }
  })
}

module.exports = {
  register,
  login,
  logout,
  getMe
}