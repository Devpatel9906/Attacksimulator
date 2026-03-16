const mongoose = require('mongoose')
const mongoSanitize = require('mongo-sanitize')

const scenarioSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'terminated'],
    default: 'draft'
  },
  attackTypes: [{
  type: String,
  enum: [
    'email_phishing',
    'credential_harvesting',
    'social_engineering',
    'malware_simulation',
    'sim_swap',
    'fileless_malware',
    'watering_hole',
    'bec',
    'ai_deepfake',
    'supply_chain'
  ]
}],
  targetDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  targetEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  patientZero: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  ghostPersonaId: { type: mongoose.Schema.Types.ObjectId, ref: 'GhostPersona', default: null },
  ghostState: {
    type: String,
    enum: ['DORMANT', 'SPAWNED', 'PROFILING', 'SPREADING', 'ESCALATING', 'TERMINATED', 'BREACHED'],
    default: 'DORMANT'
  },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  terminationReason: { type: String, default: null },
  financialExposure: { type: Number, default: 0 },
  totalHops: { type: Number, default: 0 },
  compromisedCount: { type: Number, default: 0 },
  reportedCount: { type: Number, default: 0 },
  clickedCount: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ['level_1', 'level_2', 'level_3', 'level_4', 'level_5'],
    default: 'level_1'
  }
}, { timestamps: true })

scenarioSchema.pre('save', function() {
  this.name = mongoSanitize(this.name)
})

module.exports = mongoose.model('Scenario', scenarioSchema)