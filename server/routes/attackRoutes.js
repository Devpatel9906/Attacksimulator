const { dispatchAttack } = require('../utils/channelSender')
const Employee = require('../models/Employee')
const Scenario = require('../models/Scenario')
const { authenticate } = require('../middleware/authenticate')
const { authorize } = require('../middleware/authorize')

const { nanoid } = require('nanoid')

async function attackRoutes(fastify) {


  // ───────────────── EMAIL ATTACK ─────────────────

  fastify.post('/api/attacks/email', async (req, reply) => {

    const { employeeId, scenarioId, template } = req.body

    const employee = await Employee.findById(employeeId)
    const scenario = await Scenario.findById(scenarioId)

    if (!employee)
      return reply.status(404).send({ error: 'Employee not found' })

    const token = nanoid(32)

    const trackingUrl =
      `${process.env.PUBLIC_URL}/api/sim/click/${token}`


    await dispatchAttack({
      employee,
      attackType: 'email_phishing',
      template,
      trackingUrl,
      orgName: 'Security Operations',
      managerName: 'IT Security',
      aggressionLevel: 1
    })


    return { success: true, token }

  })



  // ───────────────── SMS ATTACK ─────────────────

  fastify.post('/api/attacks/sms', async (req, reply) => {

    const { employeeId } = req.body

    const employee = await Employee.findById(employeeId)

    const token = nanoid(32)

    const trackingUrl =
      `${process.env.PUBLIC_URL}/api/sim/click/${token}`


    await dispatchAttack({
      employee,
      attackType: 'social_engineering',
      trackingUrl,
      orgName: 'Security Operations',
      managerName: 'IT Security',
      aggressionLevel: 2
    })


    return { success: true }

  })



  // ───────────────── WHATSAPP ATTACK ─────────────────

  fastify.post('/api/attacks/whatsapp', async (req, reply) => {

    const { employeeId } = req.body

    const employee = await Employee.findById(employeeId)

    const token = nanoid(32)

    const trackingUrl =
      `${process.env.PUBLIC_URL}/api/sim/click/${token}`


    await dispatchAttack({
      employee,
      attackType: 'social_engineering',
      trackingUrl,
      orgName: 'Security Operations',
      managerName: 'CEO',
      aggressionLevel: 2
    })


    return { success: true }

  })



  // ───────────────── VOICE ATTACK ─────────────────

  fastify.post('/api/attacks/voice', async (req, reply) => {

    const { employeeId } = req.body

    const employee = await Employee.findById(employeeId)

    const token = nanoid(32)

    const trackingUrl =
      `${process.env.PUBLIC_URL}/api/sim/click/${token}`


    await dispatchAttack({
      employee,
      attackType: 'sim_swap',
      trackingUrl,
      orgName: 'Carrier Support',
      managerName: 'Verification Center',
      aggressionLevel: 3
    })


    return { success: true }

  })


  // ───────────────── UNIFIED: SEND BY CHANNEL ─────────────────
  // Select channel (email, sms, whatsapp, voice, telegram), pass required fields, connects to channelSender

  const ALLOWED_CHANNELS = ['email', 'sms', 'whatsapp', 'voice', 'telegram']

  fastify.post('/api/attacks/send', { preHandler: [authenticate, authorize(['admin', 'analyst', 'defender'])] }, async (req, reply) => {

    const {
      channel,
      employeeId,
      scenarioId,
      template,
      subject,
      message: customMessage,
      aggressionLevel = 1,
      targetInput
    } = req.body || {}

    if (!channel || !ALLOWED_CHANNELS.includes(channel))
      return reply.status(400).send({
        error: 'Invalid or missing channel',
        allowed: ALLOWED_CHANNELS
      })

    if (!employeeId && !targetInput)
      return reply.status(400).send({ error: 'employeeId or targetInput is required' })

    let employee;

    if (employeeId) {
      employee = await Employee.findById(employeeId)
      if (!employee)
        return reply.status(404).send({ error: 'Employee not found' })
    } else if (targetInput) {
      employee = {
        displayName: 'Target User',
        behavioralArchetype: 'unknown'
      };
      if (channel === 'email') employee.email = targetInput;
      else if (channel === 'sms' || channel === 'whatsapp' || channel === 'voice') employee.phone = targetInput;
      else if (channel === 'telegram') employee.telegramId = targetInput;
    }

    const token = nanoid(32)
    const trackingUrl =
      `${process.env.PUBLIC_URL || ''}/api/sim/click/${token}`

    await dispatchAttack({
      employee,
      attackType: 'email_phishing',
      trackingUrl,
      orgName: 'Security Operations',
      managerName: 'IT Security',
      aggressionLevel: Number(aggressionLevel) || 1,
      channel,
      customSubject: subject || null,
      customMessage: customMessage || null,
      template: template || null
    })

    return reply.send({
      success: true,
      channel,
      token,
      message: `Phishing sent via ${channel}`
    })

  })


}

module.exports = attackRoutes