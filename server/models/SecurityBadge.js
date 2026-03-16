const mongoose = require('mongoose')

const securityBadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['chain_breaker', 'first_responder', 'skeptic', 'perfect_defense', 'comeback', 'educator']
  },
  label: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🛡️' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  awardedAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('SecurityBadge', securityBadgeSchema)