const mongoSanitize = require('mongo-sanitize')
const { spawnGhost, executeGhostHop, terminateGhost } = require('../utils/ghostEngine')
const GhostPersona = require('../models/GhostPersona')
const Scenario = require('../models/Scenario')
const { createAuditLog } = require('../utils/auditLogger')

function actor(request) {
  return { actorId: request.user?.id, actorRole: request.user?.role, ipAddress: request.ip }
}

async function spawnGhostHandler(request, reply) {
  try {
    const { scenarioId } = request.params
    const { patientZeroId } = request.body

    if (!patientZeroId) return reply.status(400).send({ error: 'patientZeroId required' })

    const ghost = await spawnGhost(
      mongoSanitize(scenarioId),
      mongoSanitize(patientZeroId)
    )

    return reply.status(201).send({
      ghost: {
        id: ghost._id,
        state: ghost.state,
        sourceEmployee: ghost.sourceEmployee,
        compromisedCount: ghost.compromisedNodes.length,
        spawnedAt: ghost.spawnedAt
      }
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: err.message || 'Internal server error' })
  }
}

async function executeHopHandler(request, reply) {
  try {
    const { ghostId } = request.params
    const result = await executeGhostHop(mongoSanitize(ghostId))

    return reply.status(200).send({ result })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: err.message || 'Internal server error' })
  }
}

async function terminateGhostHandler(request, reply) {
  try {
    const { ghostId } = request.params
    const result = await terminateGhost(mongoSanitize(ghostId), request.user.id)

    await createAuditLog({ ...actor(request), action: 'ghost.terminate.manual', outcome: 'SUCCESS', metadata: { ghostId } })

    return reply.status(200).send(result)
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: err.message || 'Internal server error' })
  }
}

async function getGhostStatus(request, reply) {
  try {
    const { ghostId } = request.params
    const ghost = await GhostPersona.findById(mongoSanitize(ghostId))
      .populate('compromisedNodes', 'firstName lastName role department displayName behavioralArchetype')
      .populate('currentTarget', 'firstName lastName role displayName')

    if (!ghost) return reply.status(404).send({ error: 'Ghost not found' })

    return reply.status(200).send({
      ghost: {
        id: ghost._id,
        state: ghost.state,
        aggressionLevel: ghost.aggressionLevel,
        currentTechnique: ghost.currentTechnique,
        currentTarget: ghost.currentTarget,
        compromisedNodes: ghost.compromisedNodes,
        compromisedCount: ghost.compromisedNodes.length,
        totalHops: ghost.compromisedNodes.length - 1,
        techniqueHistory: ghost.techniqueHistory,
        failedAttempts: ghost.failedAttempts.length,
        spawnedAt: ghost.spawnedAt,
        terminatedAt: ghost.terminatedAt
      }
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

module.exports = { spawnGhostHandler, executeHopHandler, terminateGhostHandler, getGhostStatus }