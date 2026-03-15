const cyberguardController = require('../controllers/cyberguardController');
const { authenticate } = require('../middleware/authenticate');

// Simple role guard — checks req.user.role after authenticate runs
const requireAdmin = async (req, reply) => {
  if (!req.user || req.user.role !== 'admin') {
    return reply.status(403).send({ error: 'Admin access required' });
  }
};

async function cyberguardRoutes(fastify, options) {
  // 1. Admin: Generate Templates
  fastify.post('/cyberguard/templates', { preHandler: [authenticate, requireAdmin] }, cyberguardController.generateAdminTemplates);
  
  // 2. Employee: Explain Red Flags (any authenticated user)
  fastify.post('/cyberguard/explain', { preHandler: [authenticate] }, cyberguardController.explainRedFlags);
  
  // 3. Admin: Risk Analysis
  fastify.post('/cyberguard/analyze', { preHandler: [authenticate, requireAdmin] }, cyberguardController.analyzeRisk);
}

module.exports = cyberguardRoutes;
