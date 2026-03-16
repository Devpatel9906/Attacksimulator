require('dotenv').config()
const { connectDB } = require('../config/db')
const { initAuditChain } = require('../utils/auditLogger')
const { spawnGhost, executeGhostHop } = require('../utils/ghostEngine')
const { executeWave1 } = require('../utils/waveExecutor')
const { assignModule } = require('../controllers/awarenessController')
const Scenario = require('../models/Scenario')
const Employee = require('../models/Employee')
const Organization = require('../models/Organization')
const SimulationEvent = require('../models/SimulationEvent')

async function runDemoScenario() {
  try {
    await connectDB()
    await initAuditChain()

    console.log('\n=== RUNNING DEMO SCENARIO ===\n')

    const org = await Organization.findOne({ domain: 'acmecorp.com' })
    if (!org) throw new Error('Run seedData.js first')

    // Get Finance department employees
    const Department = require('../models/Department')
    const financeDept = await Department.findOne({ organization: org._id, name: 'Finance' })
    const hrDept = await Department.findOne({ organization: org._id, name: 'HR' })

    // Create scenario
    const scenario = new Scenario({
      name: 'Demo Scenario — Acme Corporation Q1',
      organization: org._id,
      createdBy: org.createdBy,
      attackTypes: ['email_phishing', 'credential_harvesting'],
      targetDepartments: [financeDept._id, hrDept._id],
      difficulty: 'level_2',
      status: 'active',
      startedAt: new Date()
    })

    // Set target employees
    const targets = await Employee.find({
      organization: org._id,
      department: { $in: [financeDept._id, hrDept._id] }
    })
    scenario.targetEmployees = targets.map(e => e._id)
    await scenario.save()
    console.log(`Scenario created: ${scenario.name}`)
    console.log(`Targets: ${targets.length} employees`)

    // Execute Wave 1
    const wave1Result = await executeWave1(scenario._id)
    console.log(`\nWave 1 fired: ${wave1Result.eventsCreated} events`)

    // Simulate patient zero — Finance rushed responder clicks
    const patientZero = await Employee.findOne({
      department: financeDept._id,
      behavioralArchetype: 'rushed_responder'
    })

    const pzEvent = await SimulationEvent.findOne({
      scenario: scenario._id,
      employee: patientZero._id,
      attackType: 'email_phishing'
    })
    if (pzEvent) {
      pzEvent.result = 'clicked'
      pzEvent.timeToActionSeconds = 6
      pzEvent.isPatientZero = true
      await pzEvent.save()
      scenario.clickedCount += 1
      await scenario.save()
      console.log(`\nPatient Zero: ${patientZero.displayName} (${patientZero.behavioralArchetype}) — CLICKED`)
    }

    // Spawn ghost on patient zero
    const ghost = await spawnGhost(scenario._id.toString(), patientZero._id.toString())
    console.log(`Ghost spawned — state: ${ghost.state}`)

    // Execute ghost hops
    console.log('\n--- Ghost Spread ---')
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 500))
      const hop = await executeGhostHop(ghost._id.toString())
      if (hop.terminated) {
        console.log(`Ghost terminated: ${hop.reason}`)
        break
      }
      if (hop.escalated) {
        console.log(`Ghost escalating — aggression level ${hop.aggressionLevel}`)
        continue
      }
      if (hop.blocked) {
        console.log(`Hop blocked — skeptical verifier detected`)
        continue
      }
      if (hop.hop) {
        console.log(`Hop ${hop.hopNumber}: ${hop.targetName} (${hop.targetRole}) — technique: ${hop.technique}`)
        if (hop.breached) {
          console.log('ADMIN BREACHED — scenario complete')
          break
        }
      }
    }

    // Assign awareness modules to clicked employees
    const clickedEvents = await SimulationEvent.find({
      scenario: scenario._id,
      result: { $in: ['clicked', 'submitted_form'] }
    })
    for (const event of clickedEvents) {
      await assignModule(event.employee, event.attackType, scenario._id, org._id)
    }
    console.log(`\nAwareness modules assigned to ${clickedEvents.length} employees`)

    // Final stats
    const updatedScenario = await Scenario.findById(scenario._id)
    console.log('\n=== DEMO SCENARIO RESULTS ===')
    console.log(`Status: ${updatedScenario.status}`)
    console.log(`Ghost state: ${updatedScenario.ghostState}`)
    console.log(`Compromised: ${updatedScenario.compromisedCount}`)
    console.log(`Reported: ${updatedScenario.reportedCount}`)
    console.log(`Financial exposure: $${updatedScenario.financialExposure.toLocaleString()}`)
    console.log(`Scenario ID (for API testing): ${updatedScenario._id}`)

    process.exit(0)
  } catch (err) {
    console.error('Demo script failed:', err)
    process.exit(1)
  }
}

runDemoScenario()