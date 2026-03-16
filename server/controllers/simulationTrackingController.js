const mongoSanitize = require('mongo-sanitize')
const { recordEventResult } = require('../utils/waveExecutor')
const { createAuditLog } = require('../utils/auditLogger')

// Called when employee clicks link in simulation email
async function trackClick(request, reply) {
  try {

    const { token } = request.params

    if (!token)
      return reply.status(400).send({ error: 'Invalid token' })

    const metadata = {
      timeToActionSeconds: null,
      deviceType: request.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
      sessionId: mongoSanitize(request.query.sid) || null,
      deviceFingerprint: null
    }

    await recordEventResult(mongoSanitize(token), 'clicked', metadata)

    await createAuditLog({
      actorId: null,
      actorRole: 'system',
      action: 'simulation.click_tracked',
      outcome: 'SUCCESS',
      metadata: { token: token.substring(0, 8) + '...' }
    })


    // ───── Serve phishing page ─────

    const fs = require('fs')
    const path = require('path')

    const templates = [
      'microsoft.html',
      'google.html'
    ]

    const selected =
      templates[Math.floor(Math.random() * templates.length)]

    const templatePath =
      path.join(__dirname, '../public/phishing', selected)

    let html = fs.readFileSync(templatePath, 'utf8')

    html = html.replace(/TOKEN_PLACEHOLDER/g, token)

    reply.type('text/html').send(html)

  } catch (err) {

    request.log.error(err)

    return reply.status(500).send({ error: 'Internal server error' })

  }
}

// Called when employee submits form on fake landing page
// NEVER receives or stores actual credentials
async function trackFormSubmit(request, reply) {
  try {
    const { token } = request.params

    // Only accept: token, sessionId, deviceFingerprint
    // Credentials are wiped client-side before this request fires
    const { sessionId, deviceFingerprint, timeToActionSeconds } = request.body

    const metadata = {
      timeToActionSeconds: timeToActionSeconds || null,
      deviceType: request.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
      sessionId: mongoSanitize(sessionId) || null,
      deviceFingerprint: mongoSanitize(deviceFingerprint) || null
    }

    await recordEventResult(mongoSanitize(token), 'submitted_form', metadata)

    return reply.status(200).send({
      redirectTo: `${process.env.CLIENT_URL}/sim/transparency?token=${token}`
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

// Called when employee reports the simulation email
async function trackReport(request, reply) {
  try {
    const { token } = request.params
    await recordEventResult(mongoSanitize(token), 'reported', {})

    await createAuditLog({
      actorId: null,
      actorRole: 'system',
      action: 'simulation.reported',
      outcome: 'SUCCESS',
      metadata: { token: token.substring(0, 8) + '...' }
    })

    return reply.status(200).send({ message: 'Report recorded. Good catch!' })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

// Called by transparency receipt page to get event details
async function getEventDetails(request, reply) {
  try {
    const { token } = request.params
    const SimulationEvent = require('../models/SimulationEvent')
    const event = await SimulationEvent.findOne({ tokenUsed: mongoSanitize(token) })
      .populate('employee', 'firstName displayName role')
      .populate('scenario', 'name attackTypes difficulty')

    if (!event) return reply.status(404).send({ error: 'Event not found' })

    return reply.status(200).send({
      event: {
        attackType: event.attackType,
        result: event.result,
        credentialsCaptured: false, // always false
        employeeName: event.employee?.displayName,
        scenarioName: event.scenario?.name,
        recordedAt: event.recordedAt
      }
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

module.exports = { trackClick, trackFormSubmit, trackReport, getEventDetails }