const mongoose = require('mongoose')
const mongoSanitize = require('mongo-sanitize')

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  employeeCount: { type: Number, default: 0 },
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  departmentSecurityScore: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true })

departmentSchema.index({ organization: 1, name: 1 }, { unique: true })

departmentSchema.pre('save', function(next) {
  this.name = mongoSanitize(this.name)
})

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema)