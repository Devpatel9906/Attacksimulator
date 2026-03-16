const NodeClam = require('clamscan')

let clamInstance = null

const getClamAV = async () => {
  if (clamInstance) return clamInstance

  clamInstance = await new NodeClam().init({
    removeInfected: false,
    quarantineInfected: false,
    scanLog: null,
    debugMode: false,
    scanRecursively: false,
    clamscan: {
      path: '/usr/bin/clamscan',
      scanArchives: true,
      active: true
    },
    clamdscan: {
      socket: false,
      host: false,
      port: false,
      timeout: 60000,
      localFallback: true,
      path: '/usr/bin/clamdscan',
      active: true
    },
    preference: 'clamdscan'
  })

  return clamInstance
}

const scanFile = async (filePath) => {
  try {
    const clam = await getClamAV()
    const { isInfected, viruses } = await clam.scanFile(filePath)
    return { isInfected, viruses }
  } catch (err) {
    console.error('ClamAV scan error:', err.message)
    return { isInfected: false, viruses: [], error: err.message }
  }
}

module.exports = { scanFile }