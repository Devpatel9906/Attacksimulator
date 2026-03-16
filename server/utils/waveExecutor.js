const Employee = require('../models/Employee')
const SimulationEvent = require('../models/SimulationEvent')
const Scenario = require('../models/Scenario')
const Organization = require('../models/Organization')
const { setTimeout: wait } = require('timers/promises')

const { createAuditLog } = require('../utils/auditLogger')
const { dispatchAttack } = require('../utils/channelSender')
const { emitSimulationEvent } = require('./socketManager')

const { nanoid } = require('nanoid')
const { runGhostEngine, selectPropagationTargets } = require('./ghostEngine')


// Attack type → template mapping
const ATTACK_TEMPLATES = {
  email_phishing: ['invoice_fraud', 'it_password_reset', 'security_alert'],
  credential_harvesting: ['fake_sso_portal'],
  social_engineering: ['it_impersonation', 'hr_impersonation', 'manager_request'],
  malware_simulation: ['fake_attachment'],
  sim_swap: ['carrier_verification'],
  voice_phishing: ['it_voice_verification']
}


// Template selector
function selectTemplate(attackType, archetype) {

  const templates = ATTACK_TEMPLATES[attackType]

  if (attackType === 'email_phishing') {

    if (archetype === 'rushed_responder')
      return 'invoice_fraud'

    if (archetype === 'trusting_delegator')
      return 'it_password_reset'

    return 'security_alert'
  }

  return templates?.[0] || 'default'
}



async function executeWave1(scenarioId) {

  const scenario = await Scenario.findById(scenarioId)
    .populate('targetEmployees')

  if (!scenario)
    throw new Error('Scenario not found')

  if (scenario.status !== 'active')
    throw new Error('Scenario not active')


  const employees = await Employee.find({
    _id: { $in: scenario.targetEmployees },
    isActive: true
  })


  const org = await Organization.findById(scenario.organization)

  const events = []


  for (const employee of employees) {

    const ghostDecision = await runGhostEngine({
      employee,
      scenario
    })

    const attackTypes = ghostDecision.attackTypes?.length
      ? ghostDecision.attackTypes
      : scenario.attackTypes


    for (const attackType of attackTypes) {

      const token = nanoid(32)

      const template =
        ghostDecision.template ||
        selectTemplate(attackType, employee.behavioralArchetype)


      const event = new SimulationEvent({
        scenario: scenario._id,
        employee: employee._id,
        organization: scenario.organization,
        attackType,
        result: 'pending',
        credentialsCaptured: false,
        tokenUsed: token,
        hopNumber: 0
      })

      await event.save()


      const trackingUrl =
        `${process.env.PUBLIC_URL}/api/sim/click/${token}`


      await dispatchAttack({
        employee,
        attackType,
        template,
        trackingUrl,
        orgName: org?.name || 'Your Organization',
        managerName: 'IT Support',
        aggressionLevel: ghostDecision.aggressionLevel || 1
      })


      events.push({
        event,
        employee,
        template,
        token
      })
    }
  }


  await createAuditLog({
    actorId: null,
    actorRole: 'system',
    action: 'wave1.executed',
    outcome: 'SUCCESS',
    metadata: {
      scenarioId: scenario._id,
      targetCount: employees.length,
      attackTypes: scenario.attackTypes,
      eventsCreated: events.length
    }
  })


  return {
    eventsCreated: events.length,
    targetCount: employees.length
  }
}



async function executeGhostCampaign(scenarioId) {

  const scenario = await Scenario.findById(scenarioId)

  if (!scenario)
    throw new Error("Scenario not found")

  if (scenario.status !== "active")
    throw new Error("Scenario not active")


  await executeWave1(scenarioId)

  await wait(15000)


  const employees = await Employee.find({
    _id: { $in: scenario.targetEmployees },
    isActive: true
  })


  for (const employee of employees) {

    const ghostDecision = await runGhostEngine({
      employee,
      scenario
    })

    if (ghostDecision.aggressionLevel < 3)
      continue


    const token = nanoid(32)

    const event = new SimulationEvent({
      scenario: scenario._id,
      employee: employee._id,
      organization: scenario.organization,
      attackType: "social_engineering",
      result: "pending",
      tokenUsed: token,
      hopNumber: 0
    })

    await event.save()


    const trackingUrl =
      `${process.env.PUBLIC_URL}/api/sim/click/${token}`


    await dispatchAttack({
      employee,
      attackType: "social_engineering",
      trackingUrl,
      orgName: "Security Operations",
      managerName: "IT Security",
      aggressionLevel: ghostDecision.aggressionLevel
    })

  }


  await wait(15000)


  for (const employee of employees) {

    const ghostDecision = await runGhostEngine({
      employee,
      scenario
    })

    if (ghostDecision.aggressionLevel < 4)
      continue


    const token = nanoid(32)

    const event = new SimulationEvent({
      scenario: scenario._id,
      employee: employee._id,
      organization: scenario.organization,
      attackType: "malware_simulation",
      result: "pending",
      tokenUsed: token,
      hopNumber: 0
    })

    await event.save()


    const trackingUrl =
      `${process.env.PUBLIC_URL}/api/sim/click/${token}`


    await dispatchAttack({
      employee,
      attackType: "malware_simulation",
      trackingUrl,
      orgName: "Security Operations",
      managerName: "IT Security",
      aggressionLevel: ghostDecision.aggressionLevel
    })

  }

}



async function recordEventResult(token, result, metadata = {}) {

  const event = await SimulationEvent.findOne({ tokenUsed: token })

  if (!event)
    return null

  if (event.result !== 'pending')
    return event


  event.result = result
  event.timeToActionSeconds = metadata.timeToActionSeconds || null
  event.deviceType = metadata.deviceType || null
  event.sessionId = metadata.sessionId || null
  event.deviceFingerprint = metadata.deviceFingerprint || null

  await event.save()


  emitSimulationEvent(event.scenario.toString(), {
    employeeId: event.employee.toString(),
    attackType: event.attackType,
    result
  })


  const scenario = await Scenario.findById(event.scenario)

  if (scenario) {

    if (
      result === 'clicked' ||
      result === 'submitted_form' ||
      result === 'downloaded'
    ) {
      scenario.clickedCount += 1
    }

    if (result === 'reported') {
      scenario.reportedCount += 1
    }

    await scenario.save()
  }


  await Employee.findByIdAndUpdate(
    event.employee,
    { lastSimulationResult: result }
  )



  if (
    result === 'clicked' ||
    result === 'submitted_form' ||
    result === 'downloaded'
  ) {

    const infectedEmployee = await Employee.findById(event.employee)

    if (!infectedEmployee) return event


    const coworkers = await selectPropagationTargets(infectedEmployee,5)


    const probability =
      Math.min(0.35 + (event.hopNumber * 0.1), 0.8)


    const targets = coworkers
      .filter(() => Math.random() < probability)
      .slice(0, 5)


    for (const target of targets) {

      const newToken = nanoid(32)

      const newEvent = new SimulationEvent({
        scenario: event.scenario,
        employee: target._id,
        organization: event.organization,
        attackType: event.attackType,
        result: 'pending',
        tokenUsed: newToken,
        hopNumber: event.hopNumber + 1,
        isGhostHop: true
      })

      await newEvent.save()


      const trackingUrl =
        `${process.env.PUBLIC_URL}/api/sim/click/${newToken}`


      await dispatchAttack({
        employee: target,
        attackType: event.attackType,
        trackingUrl,
        orgName: 'Security Operations',
        managerName: 'IT Security',
        aggressionLevel: 2
      })

    }

  }


  return event
}



module.exports = {
  executeWave1,
  executeGhostCampaign,
  recordEventResult,
  selectTemplate
}