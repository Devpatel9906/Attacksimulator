const mongoose = require('mongoose')

const employeeProgressSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'AwarenessModule', required: true },
  scenario: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario', default: null },
  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'completed'],
    default: 'assigned'
  },
  quizScore: { type: Number, default: null },
  quizAttempts: { type: Number, default: 0 },
  completedAt: { type: Date, default: null },
  timeSpentSeconds: { type: Number, default: 0 }
}, { timestamps: true })

employeeProgressSchema.index({ employee: 1, module: 1 }, { unique: true })
employeeProgressSchema.index({ organization: 1, status: 1 })

module.exports = mongoose.model('EmployeeProgress', employeeProgressSchema)