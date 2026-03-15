const cyberguardController = require('../controllers/cyberguardController');
const { authenticate, authorize } = require('../middleware/authenticate'); // Admin API protection

async function cyberguardRoutes(fastify, options) {
  // 1. Admin: Generate Templates
  fastify.post('/cyberguard/templates', { preHandler: [authenticate, authorize(['admin'])] }, cyberguardController.generateAdminTemplates);
  
  // 2. Employee: Explain Red Flags
  fastify.post('/cyberguard/explain', { preHandler: [authenticate] }, cyberguardController.explainRedFlags);
  
  // 3. Admin: Risk Analysis
  fastify.post('/cyberguard/analyze', { preHandler: [authenticate, authorize(['admin'])] }, cyberguardController.analyzeRisk);
}

module.exports = cyberguardRoutes;
