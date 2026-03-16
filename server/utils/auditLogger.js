const crypto = require('crypto')
const AuditLog = require('../models/AuditLog')
const winston = require('winston')
const path = require('path')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/audit.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
      tailable: true
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/security.log'),
      level: 'warn'
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

let lastHash = 'GENESIS'

const initAuditChain = async () => {
  try {
    const lastEntry = await AuditLog
      .findOne()
      .sort({ timestamp: -1 })
      .select('currentHash')

    if (lastEntry) {
      lastHash = lastEntry.currentHash
      logger.info('Audit chain initialized from DB')
    } else {
      lastHash = 'GENESIS'
      logger.info('Audit chain starting fresh')
    }
  } catch (err) {
    logger.error('Failed to init audit chain', {
      error: err.message
    })
  }
}

const createAuditLog = async ({
  action,
  actorId = null,
  actorRole = null,
  resourceId = null,
  outcome,
  metadata = {},
  ipAddress = null,
  userAgent = null
}) => {
  try {
    const timestamp = new Date().toISOString()

    const content = JSON.stringify({
      action,
      actorId: actorId?.toString() || null,
      actorRole,
      resourceId: resourceId?.toString() || null,
      outcome,
      metadata,
      timestamp,
      previousHash: lastHash
    })

    const currentHash = crypto
      .createHash('sha256')
      .update(content)
      .digest('hex')

    const entry = await AuditLog.create({
      action,
      actorId,
      actorRole,
      resourceId,
      outcome,
      metadata,
      ipAddress,
      userAgent,
      timestamp: new Date(timestamp),
      previousHash: lastHash,
      currentHash
    })

    lastHash = currentHash

    logger.info({ action, actorId, outcome, metadata })

    return entry
  } catch (err) {
    logger.error({
      message: 'Audit DB write failed',
      action,
      actorId,
      outcome,
      error: err.message
    })
  }
}

const verifyAuditChain = async () => {
  const entries = await AuditLog
    .find()
    .sort({ timestamp: 1 })
    .lean()

  if (entries.length === 0) {
    return {
      valid: true,
      entryCount: 0,
      message: 'No entries'
    }
  }

  let previousHash = 'GENESIS'
  let tamperDetected = false
  let tamperAt = null

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]

    if (entry.previousHash !== previousHash) {
      tamperDetected = true
      tamperAt = {
        entryIndex: i,
        entryId: entry._id,
        timestamp: entry.timestamp,
        action: entry.action
      }
      break
    }

    const content = JSON.stringify({
      action: entry.action,
      actorId: entry.actorId?.toString() || null,
      actorRole: entry.actorRole,
      resourceId: entry.resourceId?.toString() || null,
      outcome: entry.outcome,
      metadata: entry.metadata,
      timestamp: entry.timestamp.toISOString(),
      previousHash: entry.previousHash
    })

    const recomputedHash = crypto
      .createHash('sha256')
      .update(content)
      .digest('hex')

    if (recomputedHash !== entry.currentHash) {
      tamperDetected = true
      tamperAt = {
        entryIndex: i,
        entryId: entry._id,
        timestamp: entry.timestamp,
        action: entry.action,
        reason: 'Hash mismatch — entry modified'
      }
      break
    }

    previousHash = entry.currentHash
  }

  return {
    valid: !tamperDetected,
    entryCount: entries.length,
    tamperDetected,
    tamperAt,
    lastVerifiedHash: previousHash,
    verifiedAt: new Date().toISOString()
  }
}

module.exports = {
  createAuditLog,
  initAuditChain,
  verifyAuditChain
}