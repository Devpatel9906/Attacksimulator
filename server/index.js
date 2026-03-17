const Fastify = require('fastify')
require('dotenv').config()
const { connectDB } = require('./config/db')
const {
  initAuditChain,
  createAuditLog
} = require('./utils/auditLogger')
const { initSocket } = require('./utils/socketManager')

const orgRoutes = require('./routes/orgRoutes')
const scenarioRoutes = require('./routes/scenarioRoutes')
const simulationRoutes = require('./routes/simulationRoutes')
const ghostRoutes = require('./routes/ghostRoutes')
const defenderRoutes = require('./routes/defenderRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const awarenessRoutes = require('./routes/awarenessRoutes') // NEW
const employeeAuthRoutes = require('./routes/employeeAuthRoutes') // ADDED
const attackRoutes = require('./routes/attackRoutes')
const adminAttackRoutes = require('./routes/adminAttackRoutes')


const app = Fastify({ 
  logger: true,
  trustProxy: true // Essential for Render/Vercel proxy headers
})

const start = async () => {
  try {
    await app.register(require('@fastify/cors'), {
      origin: (origin, cb) => {
        // Allow local dev
        if (!origin || /localhost:\d+$/.test(origin) || /127\.0\.0\.1:\d+$/.test(origin)) {
          cb(null, true);
          return;
        }
        
        // Allow FRONTEND_URL and Vercel subdomains if needed
        if (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL)) {
          cb(null, true);
          return;
        }

        // Broaden for Vercel previews if necessary
        if (origin.endsWith('.vercel.app')) {
          cb(null, true);
          return;
        }

        cb(null, false);
      },
      credentials: true
    })

    await app.register(require('@fastify/helmet'), {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"]
        }
      }
    })

    await app.register(require('@fastify/cookie'))

    await app.register(require('@fastify/jwt'), {
      secret: process.env.JWT_SECRET,
      cookie: {
        cookieName: 'token',
        signed: false
      }
    })

    await app.register(require('@fastify/multipart'), {
      limits: { fileSize: 5 * 1024 * 1024, files: 1 }
    })

    await connectDB()
    await initAuditChain()

    app.register(require('./routes/authRoutes'))

    app.register(orgRoutes, { prefix: '/api' })
    app.register(scenarioRoutes, { prefix: '/api' })
    app.register(simulationRoutes, { prefix: '/api' })
    app.register(ghostRoutes, { prefix: '/api' })
    app.register(defenderRoutes, { prefix: '/api' })
    app.register(analyticsRoutes, { prefix: '/api' })
    app.register(awarenessRoutes, { prefix: '/api' }) // NEW
    app.register(employeeAuthRoutes, { prefix: '/api' }) // ADDED
    app.register(attackRoutes)
    app.register(adminAttackRoutes, { prefix: '/api' })

    app.get('/health', async () => ({
      status: 'ok',
      timestamp: new Date().toISOString()
    }))

    await app.listen({
      port: process.env.PORT || 5000,
      host: '0.0.0.0'
    })

    initSocket(app.server)

    await createAuditLog({
      action: 'SERVER_START',
      outcome: 'SUCCESS',
      metadata: {
        port: process.env.PORT || 5000,
        environment: process.env.NODE_ENV
      }
    })

    console.log('AttackSimulator running on port 5000')

  } catch (err) {
    console.error('Startup failed:', err)
    process.exit(1)
  }
}

start()