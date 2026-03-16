const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

let transporter = null

function getTransporter() {
  if (transporter) return transporter
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
  return transporter
}

function loadTemplate(templateName) {
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`)
  const source = fs.readFileSync(templatePath, 'utf8')
  return handlebars.compile(source)
}

async function sendSimulationEmail({ to, templateName, variables }) {
  try {
    const compile = loadTemplate(templateName)
    const html = compile(variables)

    const transport = getTransporter()
    await transport.sendMail({
      from: `"${variables.senderName || 'IT Security'}" <${process.env.SMTP_USER}>`,
      to,
      subject: variables.subject || 'Action Required',
      html
    })
    return { sent: true }
  } catch (err) {
    console.error('[MAILER] Failed to send:', err.message)
    return { sent: false, error: err.message }
  }
}

module.exports = { sendSimulationEmail }