const mongoose = require('mongoose')
const mongoSanitize = require('mongo-sanitize')

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
  industry: {
    type: String,
    required: true,
    enum: ['healthcare', 'financial_services', 'technology', 'education', 'retail', 'other']
  },
  employeeCount: { type: Number, default: 0 },
  securityCultureScore: { type: Number, default: 0, min: 0, max: 100 },
  securityCultureBreakdown: {
    reportRate: { type: Number, default: 0 },
    meanTimeToReport: { type: Number, default: 0 },
    moduleCompletion: { type: Number, default: 0 },
    scoreImprovement: { type: Number, default: 0 },
    streakMaintenance: { type: Number, default: 0 }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

organizationSchema.pre('save', function(next) {
  this.name = mongoSanitize(this.name)
  this.domain = mongoSanitize(this.domain)
})

module.exports = mongoose.model('Organization', organizationSchema)