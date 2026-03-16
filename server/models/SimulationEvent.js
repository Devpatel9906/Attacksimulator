const mongoose = require('mongoose')

const simulationEventSchema = new mongoose.Schema({

  scenario: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },

  result: {
    type: String,
    enum: ["pending", "clicked", "submitted_form", "downloaded", "reported"],
    default: "pending"
  },

  attackType: {
    type: String,
    required: true,
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
  },

  credentialsCaptured: { type: Boolean, default: false, immutable: true },

  timeToActionSeconds: { type: Number, default: null },
  deviceType: { type: String, default: null },

  isPatientZero: { type: Boolean, default: false },
  isGhostHop: { type: Boolean, default: false },
  hopNumber: { type: Number, default: 0 },

  tokenUsed: { type: String, default: null },
  sessionId: { type: String, default: null },
  deviceFingerprint: { type: String, default: null },

  recordedAt: { type: Date, default: Date.now }

}, { timestamps: true })

simulationEventSchema.index({ scenario: 1, employee: 1 })
simulationEventSchema.index({ scenario: 1, result: 1 })
simulationEventSchema.index({ organization: 1, recordedAt: -1 })

module.exports = mongoose.model('SimulationEvent', simulationEventSchema)