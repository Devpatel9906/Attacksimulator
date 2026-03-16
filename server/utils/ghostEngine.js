const Employee = require('../models/Employee')
const SimulationEvent = require('../models/SimulationEvent')
const Department = require('../models/Department')
const { selectTechnique } = require('./techniqueSelector')

async function runGhostEngine({ employee, scenario }) {

  const pastEvents = await SimulationEvent.find({
    employee: employee._id,
    scenario: scenario._id
  }).sort({ createdAt: -1 }).limit(10)

  let failureScore = 0

  for (const ev of pastEvents) {

    if (
      ev.result === 'clicked' ||
      ev.result === 'submitted_form' ||
      ev.result === 'downloaded'
    ) {
      failureScore += 2
    }

    if (ev.result === 'reported') {
      failureScore -= 1
    }

  }

  let aggressionLevel = 1
  let attackTypes = []

  if (failureScore <= 0) {
    aggressionLevel = 1
    attackTypes = ['email_phishing']
  }

  else if (failureScore <= 3) {
    aggressionLevel = 2
    attackTypes = ['email_phishing','credential_harvesting']
  }

  else if (failureScore <= 6) {
    aggressionLevel = 3
    attackTypes = ['email_phishing','credential_harvesting','social_engineering']
  }

  else if (failureScore <= 10) {
    aggressionLevel = 4
    attackTypes = ['email_phishing','credential_harvesting','social_engineering','malware_simulation']
  }

  else {
    aggressionLevel = 5
    attackTypes = ['email_phishing','credential_harvesting','social_engineering','malware_simulation','sim_swap']
  }

  const technique = selectTechnique({
    archetype: employee.behavioralArchetype,
    aggressionLevel
  })

  return {
    aggressionLevel,
    attackTypes,
    template: technique?.template || null,
    failureScore
  }

}


async function selectPropagationTargets(infectedEmployee, limit = 5) {

  const coworkers = await Employee.find({
    department: infectedEmployee.department,
    _id: { $ne: infectedEmployee._id },
    isActive: true
  }).limit(limit)

  return coworkers

}

module.exports = {
  runGhostEngine,
  selectPropagationTargets
}