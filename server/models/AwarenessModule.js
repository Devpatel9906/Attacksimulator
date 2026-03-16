const mongoose = require('mongoose')
const mongoSanitize = require('mongo-sanitize')

const awarenessModuleSchema = new mongoose.Schema({
  attackType: {
    type: String,
    required: true,
    enum: ['email_phishing', 'credential_harvesting', 'social_engineering', 'malware_simulation', 'sim_swap']
  },
  difficulty: {
    type: String,
    enum: ['level_1', 'level_2', 'level_3', 'level_4', 'level_5'],
    default: 'level_1'
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  quiz: [{
    question: { type: String, required: true },
    options: [{ type: String }],
    correctIndex: { type: Number, required: true },
    explanation: { type: String }
  }],
  simulationType: {
    type: String,
    enum: ['ransomware_desktop', 'identity_tree', 'hacker_dashboard', 'ghost_in_machine', '2fa_paradox', 'infected_community', null],
    default: null
  },
  estimatedMinutes: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('AwarenessModule', awarenessModuleSchema)