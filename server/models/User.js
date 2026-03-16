const mongoose = require('mongoose')
const crypto = require('crypto')
const argon2 = require('argon2')

const ENCRYPTION_KEY = Buffer.from(
  (process.env.FIELD_ENCRYPTION_SECRET || 'default_dev_secret_key')
    .padEnd(32, '0')
    .slice(0, 32)
)

const IV_LENGTH = 16

const encrypt = (text) => {
  if (!text) return text

  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY,
    iv
  )

  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])

  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

const decrypt = (text) => {
  if (!text) return text

  try {
    const parts = text.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encryptedText = Buffer.from(parts[1], 'hex')

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      ENCRYPTION_KEY,
      iv
    )

    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
  } catch {
    return text
  }
}

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },

  password: {
    type: String,
    required: [true, 'Password is required']
  },

  role: {
    type: String,
    enum: ['admin', 'analyst', 'defender', 'employee'],
    default: 'employee'
  },

  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },

  failedLoginAttempts: {
    type: Number,
    default: 0
  },

  lockedUntil: {
    type: Date,
    default: null
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastLoginAt: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

})

/*
Encrypt email before saving
*/
userSchema.pre('save', function () {
  if (this.isModified('email')) {
    this.email = encrypt(this.email.toLowerCase().trim())
  }
})

/*
Return decrypted email
*/
userSchema.methods.getEmail = function () {
  return decrypt(this.email)
}

/*
Find user by email (decrypt comparison workaround)
*/
userSchema.statics.findByEmail = async function (email) {
  const users = await this.find()

  for (const user of users) {
    if (user.getEmail() === email.toLowerCase().trim()) {
      return user
    }
  }

  return null
}

/*
Set email (used by seed script)
*/
userSchema.statics.setEmail = async function (user, email) {
  user.email = email.toLowerCase().trim()
}

/*
Set password using argon2
*/
userSchema.methods.setPassword = async function (password) {
  this.password = await argon2.hash(password)
}

/*
Compare password during login
*/
userSchema.methods.comparePassword = async function (password) {
  return argon2.verify(this.password, password)
}

/*
Check if account is locked
*/
userSchema.methods.isLocked = function () {
  if (!this.lockedUntil) return false
  if (this.lockedUntil > new Date()) return true
  return false
}

/*
Increment failed login attempts
*/
userSchema.methods.incrementFailedAttempts = async function () {

  this.failedLoginAttempts += 1

  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
    this.failedLoginAttempts = 0
  }

  await this.save()
}

/*
Reset failed attempts
*/
userSchema.methods.resetFailedAttempts = async function () {
  this.failedLoginAttempts = 0
  this.lockedUntil = null
  this.lastLoginAt = new Date()
  await this.save()
}

/*
Safe model export
*/
module.exports =
  mongoose.models.User || mongoose.model('User', userSchema)