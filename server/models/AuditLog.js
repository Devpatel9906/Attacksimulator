const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },

  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  actorRole: {
    type: String,
    default: null
  },

  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  outcome: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'BLOCKED'],
    required: true
  },

  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  ipAddress: {
    type: String,
    default: null
  },

  userAgent: {
    type: String,
    default: null
  },

  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },

  previousHash: {
    type: String,
    required: true
  },

  currentHash: {
    type: String,
    required: true
  }
})

auditLogSchema.index({ action: 1, timestamp: -1 })
auditLogSchema.index({ actorId: 1, timestamp: -1 })
auditLogSchema.index({ outcome: 1, timestamp: -1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)