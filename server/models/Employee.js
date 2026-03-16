const mongoose = require('mongoose')
const mongoSanitize = require('mongo-sanitize')
const crypto = require('crypto')

const ENCRYPTION_KEY = Buffer.from(process.env.EMAIL_ENCRYPTION_KEY || 'a'.repeat(64), 'hex')
const IV_LENGTH = 16


/* ENCRYPT EMAIL */

function encryptEmail(text) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return iv.toString('hex') + ':' + encrypted
}


/* DECRYPT EMAIL */

function decryptEmail(text) {
  const [ivHex, encrypted] = text.split(':')
  const iv = Buffer.from(ivHex, 'hex')

  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}


/* SCHEMA */

const employeeSchema = new mongoose.Schema({

  emailEncrypted: { type: String, required: true },
  emailHash: { type: String, required: true, unique: true },


  /* PHONE */

  phoneEncrypted: { type: String, default: null },
  phoneHash: { type: String, default: null },
  whatsappNumber: { type: String, default: null },


  /* PASSWORD SECURITY */

  passwordHash: { type: String, default: null },
  passwordSetAt: { type: Date, default: null },
  passwordResetToken: { type: String, default: null },
  passwordResetExpiry: { type: Date, default: null },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },


  preferredChannels: {
    type: [String],
    enum: ['email', 'sms', 'whatsapp', 'voice'],
    default: ['email']
  },


  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },


  role: {
    type: String,
    required: true,
    enum: [
      'admin',
      'it_support',
      'finance_manager',
      'finance_analyst',
      'hr_manager',
      'general_employee'
    ]
  },


  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },


  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },


  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },


  displayName: { type: String },


  behavioralArchetype: {
    type: String,
    enum: [
      'rushed_responder',
      'trusting_delegator',
      'distracted_clicker',
      'skeptical_verifier',
      'unknown'
    ],
    default: 'unknown'
  },


  roleSensitivityWeight: { type: Number, default: 0.4 },

  securityScore: { type: Number, default: 0, min: 0, max: 100 },

  scenariosCompleted: { type: Number, default: 0 },

  scenariosFailed: { type: Number, default: 0 },

  awarModulesCompleted: { type: Number, default: 0 },

  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SecurityBadge' }],

  isActive: { type: Boolean, default: true },

  isCompromised: { type: Boolean, default: false },


  lastSimulationResult: {
    type: String,
    enum: ['clicked', 'reported', 'ignored', 'submitted_form', null],
    default: null
  }

}, { timestamps: true })


/* EMAIL VIRTUAL */

employeeSchema.virtual('email').get(function () {
  if (!this.emailEncrypted) return null
  try { return decryptEmail(this.emailEncrypted) } catch { return null }
})


/* PHONE VIRTUAL */

employeeSchema.virtual('phone').get(function () {
  if (!this.phoneEncrypted) return null
  try { return decryptEmail(this.phoneEncrypted) } catch { return null }
})


/* SANITIZE + COMPUTED FIELDS */

employeeSchema.pre('save', function () {

  this.firstName = mongoSanitize(this.firstName)
  this.lastName = mongoSanitize(this.lastName)

  this.displayName = `${this.firstName} ${this.lastName}`

  const ROLE_WEIGHTS = {
    admin: 1.0,
    it_support: 0.9,
    finance_manager: 0.8,
    finance_analyst: 0.6,
    hr_manager: 0.7,
    general_employee: 0.4
  }

  this.roleSensitivityWeight = ROLE_WEIGHTS[this.role] ?? 0.4
})


/* EMAIL METHODS */

employeeSchema.statics.setEmail = function (employeeDoc, rawEmail) {

  const normalized = rawEmail.toLowerCase().trim()

  employeeDoc.emailEncrypted = encryptEmail(normalized)

  employeeDoc.emailHash = crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex')
}


employeeSchema.statics.findByEmail = function (rawEmail) {

  const hash = crypto
    .createHash('sha256')
    .update(rawEmail.toLowerCase().trim())
    .digest('hex')

  return this.findOne({ emailHash: hash })
}


/* PHONE METHODS */

employeeSchema.statics.setPhone = function (employeeDoc, rawPhone) {

  if (!rawPhone) return

  const normalized = rawPhone.replace(/\s+/g, '').trim()

  employeeDoc.phoneEncrypted = encryptEmail(normalized)

  employeeDoc.phoneHash = crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex')

  employeeDoc.whatsappNumber = normalized
}


employeeSchema.statics.findByPhone = function (rawPhone) {

  const hash = crypto
    .createHash('sha256')
    .update(rawPhone.replace(/\s+/g, '').trim())
    .digest('hex')

  return this.findOne({ phoneHash: hash })
}


/* PASSWORD METHODS */

employeeSchema.methods.setPassword = async function (plainPassword) {

  const argon2 = require('argon2')

  this.passwordHash = await argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3
  })

  this.passwordSetAt = new Date()
}


employeeSchema.methods.verifyPassword = async function (plainPassword) {

  if (!this.passwordHash) return false

  const argon2 = require('argon2')

  return argon2.verify(this.passwordHash, plainPassword)
}


employeeSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > new Date()
}


employeeSchema.methods.incrementFailedAttempts = async function () {

  this.failedLoginAttempts += 1

  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
  }

  await this.save()
}


employeeSchema.methods.resetFailedAttempts = async function () {

  this.failedLoginAttempts = 0
  this.lockedUntil = null
  this.lastLoginAt = new Date()

  await this.save()
}


/* HELPER METHOD FOR DEBUGGING */

employeeSchema.methods.getEmail = function () {
  if (!this.emailEncrypted) return null
  try {
    return decryptEmail(this.emailEncrypted)
  } catch {
    return null
  }
}


/* INCLUDE VIRTUALS */

employeeSchema.set('toJSON', { virtuals: true })
employeeSchema.set('toObject', { virtuals: true })


module.exports = mongoose.model('Employee', employeeSchema)