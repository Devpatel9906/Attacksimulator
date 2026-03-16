const {
  trackClick,
  trackFormSubmit,
  trackReport,
  getEventDetails
} = require('../controllers/simulationTrackingController')

const { executeGhostCampaign } = require('../utils/waveExecutor')

const path = require('path')
const fs = require('fs')


async function simulationRoutes(fastify, opts) {

  // ───────── CLICK TRACKING + PHISHING PAGE ─────────

  fastify.get('/sim/click/:token', async (request, reply) => {

    const { token } = request.params

    // record click event
    await trackClick(request, reply)

    const phishingPage = path.join(__dirname, '../public/phishing/login.html')

    if (!fs.existsSync(phishingPage)) {
      return reply.status(500).send({
        error: "Phishing page missing"
      })
    }

    let html = fs.readFileSync(phishingPage, 'utf8')

    // inject token into page
    html = html.replace(
      '__TOKEN__',
      token
    )

    reply.header('Content-Type', 'text/html')

    return reply.send(html)

  })


  // ───────── FORM SUBMIT TRACKING ─────────

  fastify.post('/sim/submit/:token', trackFormSubmit)


  // ───────── USER REPORTING PHISHING ─────────

  fastify.post('/sim/report/:token', trackReport)


  // ───────── EVENT DETAILS ─────────

  fastify.get('/sim/event/:token', getEventDetails)



  // ───────── START GHOST CAMPAIGN ─────────

  fastify.post('/sim/start/:scenarioId', async (request, reply) => {

    const { scenarioId } = request.params

    try {

      executeGhostCampaign(scenarioId)

      return reply.send({
        status: "Ghost campaign started",
        scenarioId
      })

    } catch (err) {

      request.log.error(err)

      return reply.status(500).send({
        error: "Failed to start simulation"
      })
    }

  })



  // ───────── SERVE PHISHING MEDIA (PDF etc) ─────────

  fastify.get('/sim/media/:filename', async (request, reply) => {

    const { filename } = request.params

    const filePath = path.join(__dirname, '../uploads', filename)

    if (!fs.existsSync(filePath)) {
      return reply.status(404).send({ error: 'File not found' })
    }

    const stream = fs.createReadStream(filePath)

    reply.header('Content-Type', 'application/pdf')

    return reply.send(stream)

  })

}

module.exports = simulationRoutes