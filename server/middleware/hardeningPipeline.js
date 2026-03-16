const { fileTypeFromBuffer } = require('file-type')
const NodeClam = require('clamscan')
const path = require('path')
const fs = require('fs/promises')

let clamscan

async function initClam() {
  if (clamscan) return clamscan
  try {
    clamscan = await new NodeClam().init({
      removeInfected: true,
      quarantineInfected: false,
      scanLog: null,
      debugMode: false,
      fileList: null,
      scanRecursively: false,
      clamscan: { active: false },
      clamdscan: {
        socket: '/var/run/clamav/clamd.ctl',
        timeout: 60000,
        localFallback: true,
        active: true,
      },
    })
  } catch {
    console.warn('[HARDENING] ClamAV unavailable — skipping virus scan in dev')
    clamscan = null
  }
  return clamscan
}

const ALLOWED_EXTENSIONS = ['.csv']
const MAX_FILE_SIZE = 5 * 1024 * 1024

async function hardeningPipeline(request, reply) {
  const data = await request.file()
  if (!data) return reply.status(400).send({ error: 'No file uploaded' })

  const chunks = []
  for await (const chunk of data.file) chunks.push(chunk)
  const buffer = Buffer.concat(chunks)

  if (buffer.length > MAX_FILE_SIZE)
    return reply.status(400).send({ error: 'File too large. Maximum 5MB.' })

  const ext = path.extname(data.filename || '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext))
    return reply.status(400).send({ error: 'Invalid file type. Only CSV files accepted.' })

  const detected = await fileTypeFromBuffer(buffer)
  if (detected)
    return reply.status(400).send({ error: `File content mismatch. Detected: ${detected.mime}. Expected CSV.` })

  const scanner = await initClam()
  if (scanner) {
    const tmpPath = `/tmp/upload_${Date.now()}_${Math.random().toString(36).slice(2)}.csv`
    await fs.writeFile(tmpPath, buffer)
    try {
      const { isInfected } = await scanner.isInfected(tmpPath)
      if (isInfected) {
        await fs.unlink(tmpPath).catch(() => {})
        return reply.status(400).send({ error: 'File failed security scan.' })
      }
    } finally {
      await fs.unlink(tmpPath).catch(() => {})
    }
  }

  request.uploadedBuffer = buffer
  request.uploadedFilename = data.filename
}

module.exports = { hardeningPipeline }