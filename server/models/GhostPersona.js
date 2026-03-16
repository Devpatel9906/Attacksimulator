const mongoose = require('mongoose')

const ghostPersonaSchema = new mongoose.Schema({
  scenario: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  // Patient zero data — display only, never credentials
  sourceEmployee: {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    displayName: { type: String },
    department: { type: String },
    role: { type: String },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    colleagues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
  },
  // Ghost never stores passwords or real credentials
  currentTarget: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  compromisedNodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  failedAttempts: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    technique: { type: String },
    failedAt: { type: Date }
  }],
  techniqueHistory: [{ type: String }],
  currentTechnique: { type: String, default: null },
  aggressionLevel: { type: Number, default: 1, min: 1, max: 5 },
  state: {
    type: String,
    enum: ['DORMANT', 'SPAWNED', 'PROFILING', 'SPREADING', 'ESCALATING', 'TERMINATED', 'BREACHED'],
    default: 'DORMANT'
  },
  spawnedAt: { type: Date, default: null },
  terminatedAt: { type: Date, default: null },
  terminatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

module.exports = mongoose.model('GhostPersona', ghostPersonaSchema)