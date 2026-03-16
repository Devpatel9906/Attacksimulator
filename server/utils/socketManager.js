const { Server } = require('socket.io')

let io = null

function initSocket(fastifyServer) {
  io = new Server(fastifyServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    // Join scenario room for live updates
    socket.on('join:scenario', (scenarioId) => {
      socket.join(`scenario:${scenarioId}`)
    })

    socket.on('leave:scenario', (scenarioId) => {
      socket.leave(`scenario:${scenarioId}`)
    })

    socket.on('disconnect', () => {})
  })

  return io
}

function emitGhostHop(scenarioId, hopData) {
  if (!io) return
  io.to(`scenario:${scenarioId}`).emit('ghost:hop', hopData)
}

function emitGhostState(scenarioId, state) {
  if (!io) return
  io.to(`scenario:${scenarioId}`).emit('ghost:state', state)
}

function emitSimulationEvent(scenarioId, eventData) {
  if (!io) return
  io.to(`scenario:${scenarioId}`).emit('simulation:event', eventData)
}

function emitScenarioComplete(scenarioId, summary) {
  if (!io) return
  io.to(`scenario:${scenarioId}`).emit('scenario:complete', summary)
}

function getIO() {
  return io
}

module.exports = { initSocket, emitGhostHop, emitGhostState, emitSimulationEvent, emitScenarioComplete, getIO }