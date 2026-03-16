const mongoSanitize = require('mongo-sanitize')
const Employee = require('../models/Employee')
const EmployeeProgress = require('../models/EmployeeProgress')
const SecurityBadge = require('../models/SecurityBadge')
const SimulationEvent = require('../models/SimulationEvent')
const Scenario = require('../models/Scenario')
const { createAuditLog } = require('../utils/auditLogger')

function isOwner(request, employeeId) {
  return request.user.employeeId?.toString() === employeeId.toString()
}

async function getMyProfile(request, reply) {
  try {
    const employeeId = request.user.employeeId
    if (!employeeId) return reply.status(403).send({ error: 'Employee access only' })

    const employee = await Employee.findById(employeeId)
      .populate('department', 'name')
      .populate('badges')

    if (!employee) return reply.status(404).send({ error: 'Employee not found' })

    const recentEvents = await SimulationEvent.find({ employee: employeeId })
      .sort({ recordedAt: -1 })
      .limit(5)
      .populate('scenario', 'name attackTypes')

    const modulesAssigned = await EmployeeProgress.countDocuments({ employee: employeeId })
    const modulesCompleted = await EmployeeProgress.countDocuments({ employee: employeeId, status: 'completed' })

    return reply.status(200).send({
      profile: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        displayName: employee.displayName,
        role: employee.role,
        department: employee.department,
        securityScore: employee.securityScore,
        behavioralArchetype: employee.behavioralArchetype,
        scenariosCompleted: employee.scenariosCompleted,
        scenariosFailed: employee.scenariosFailed,
        awarModulesCompleted: employee.awarModulesCompleted,
        badges: employee.badges,
        lastLoginAt: employee.lastLoginAt
      },
      stats: {
        modulesAssigned,
        modulesCompleted,
        completionRate: modulesAssigned > 0 ? Math.round((modulesCompleted / modulesAssigned) * 100) : 0
      },
      recentActivity: recentEvents.map(e => ({
        scenarioName: e.scenario?.name,
        attackType: e.attackType,
        result: e.result,
        recordedAt: e.recordedAt
      }))
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function getMyModules(request, reply) {
  try {
    const employeeId = request.user.employeeId
    if (!employeeId) return reply.status(403).send({ error: 'Employee access only' })

    const progress = await EmployeeProgress.find({ employee: employeeId })
      .populate('module')
      .sort({ createdAt: -1 })

    return reply.status(200).send({
      modules: progress.map(p => ({
        progressId: p._id,
        module: {
          id: p.module._id,
          title: p.module.title,
          attackType: p.module.attackType,
          difficulty: p.module.difficulty,
          estimatedMinutes: p.module.estimatedMinutes,
          simulationType: p.module.simulationType
        },
        status: p.status,
        quizScore: p.quizScore,
        quizAttempts: p.quizAttempts,
        completedAt: p.completedAt,
        assignedAt: p.createdAt
      }))
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function getMyDebrief(request, reply) {
  try {
    const employeeId = request.user.employeeId
    if (!employeeId) return reply.status(403).send({ error: 'Employee access only' })

    const { scenarioId } = request.params

    const events = await SimulationEvent.find({
      employee: employeeId,
      scenario: mongoSanitize(scenarioId)
    }).populate('scenario', 'name attackTypes difficulty')

    if (events.length === 0) return reply.status(404).send({ error: 'No events found for this scenario' })

    const scenario = events[0].scenario

    const debrief = events.map(e => {
      const redFlags = getRedFlags(e.attackType)
      const whatShouldHaveDone = getCorrectAction(e.attackType, e.result)
      const whatAttackerGot = getAttackerGot(e.attackType, e.result)

      return {
        attackType: e.attackType,
        result: e.result,
        timeToActionSeconds: e.timeToActionSeconds,
        isGhostHop: e.isGhostHop,
        credentialsCaptured: false,
        redFlags,
        whatShouldHaveDone,
        whatAttackerGot,
        recordedAt: e.recordedAt
      }
    })

    return reply.status(200).send({
      scenarioName: scenario?.name,
      employeeId,
      debrief
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function getMyBadges(request, reply) {
  try {
    const employeeId = request.user.employeeId
    if (!employeeId) return reply.status(403).send({ error: 'Employee access only' })

    const badges = await SecurityBadge.find({ employee: employeeId }).sort({ awardedAt: -1 })

    return reply.status(200).send({
      badges: badges.map(b => ({
        id: b._id, name: b.name, label: b.label,
        description: b.description, icon: b.icon, awardedAt: b.awardedAt
      }))
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

// Helper functions
function getRedFlags(attackType) {
  const flags = {
    email_phishing: ['Urgency and fear language', 'Sender domain mismatch', 'Generic greeting', 'Suspicious link URL'],
    credential_harvesting: ['Unexpected login page', 'URL does not match company domain', 'No HTTPS', 'Asking for password via email'],
    social_engineering: ['Unusual request from authority', 'Pressure to bypass normal procedure', 'Secrecy requested', 'Unverifiable identity'],
    malware_simulation: ['Unexpected file attachment', 'Executable file in email', 'Software from unofficial source'],
    sim_swap: ['Carrier asking to verify via SMS link', 'Sudden loss of phone service', 'OTP arriving unexpectedly'],
    bec: ['CEO asking for urgent wire transfer', 'Request to keep confidential', 'Slightly different email domain'],
    ai_deepfake: ['Unexpected voice message from manager', 'Urgent password reset request by phone', 'Caller cannot verify identity another way'],
    fileless_malware: ['IT tool download from email link', 'Unexpected software update request', 'Admin rights requested'],
    watering_hole: ['Unfamiliar redirect on trusted site', 'Browser asking to run script', 'Unexpected download prompt'],
    supply_chain: ['Vendor update arriving by email not in-app', 'Update requires disabling security software']
  }
  return flags[attackType] || ['Unexpected request', 'Urgency without verification']
}

function getCorrectAction(attackType, result) {
  if (result === 'reported') return 'You did the right thing — reporting suspicious activity is exactly correct.'
  const actions = {
    email_phishing: 'Verify the sender domain. Call the sender on a known number. Report to IT security.',
    credential_harvesting: 'Never enter credentials from an email link. Go directly to the website URL.',
    social_engineering: 'Verify identity through a separate channel. Never bypass procedure under pressure.',
    malware_simulation: 'Never open attachments from unexpected emails. Report to IT immediately.',
    sim_swap: 'If you lose service unexpectedly — call your bank and carrier from another phone immediately.',
    bec: 'Always verify wire transfers by calling the requester on a known number. Never use reply email.',
    ai_deepfake: 'Verify identity through a second channel. Use a code word system with your manager.',
    fileless_malware: 'Only download IT tools from the official company portal. Never from email links.',
    watering_hole: 'Keep browser and OS updated. Use endpoint protection. Report unexpected downloads.',
    supply_chain: 'Only install vendor updates through official channels — never from email links.'
  }
  return actions[attackType] || 'Always verify unexpected requests through a separate trusted channel.'
}

function getAttackerGot(attackType, result) {
  if (result === 'reported') return 'Nothing — you reported it before any data was exposed.'
  if (result === 'ignored') return 'Nothing — you ignored it.'
  if (result === 'clicked') return 'Your device fingerprint, browser type, time of click, and location data.'
  if (result === 'submitted_form') return 'Your device fingerprint, session ID, and time to submit. Your credentials were NOT captured — this was a simulation.'
  return 'Behavioral data only. No credentials were ever captured.'
}

module.exports = { getMyProfile, getMyModules, getMyDebrief, getMyBadges }