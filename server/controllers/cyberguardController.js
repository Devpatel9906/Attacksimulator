const { askCyberGuard, hasAiEnabled } = require('../utils/geminiClient');

async function generateAdminTemplates(request, reply) {
  if (!hasAiEnabled()) {
    return reply.status(503).send({ error: "CyberGuard AI is not configured. (Missing GEMINI_API_KEY)" });
  }

  const { theme, targetDepartment } = request.body || {};
  let context = "You are assisting an IT administrator in designing a new phishing campaign.";
  if (theme) context += `\nThe requested theme is: ${theme}`;
  if (targetDepartment) context += `\nThe target department is: ${targetDepartment}`;

  context += `\nRemember: Be highly technical, authoritative, and suggest realistic, current real-world threats that would test employee vigilance. Provide 3 distinct template ideas including subject lines and core psychological triggers.`;

  try {
    const aiResponse = await askCyberGuard([
      { role: "user", content: "Please generate phishing template ideas for an upcoming simulation campaign." }
    ], context);

    return reply.send({ result: aiResponse });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "CyberGuard AI failed to generate templates." });
  }
}

async function explainRedFlags(request, reply) {
  if (!hasAiEnabled()) {
    return reply.status(503).send({ error: "CyberGuard AI is not configured." });
  }

  const { attackType, userAction, scenarioDetails } = request.body;
  if (!attackType || !userAction) {
    return reply.status(400).send({ error: "attackType and userAction are required." });
  }

  const context = `
You are speaking directly to an everyday employee who just participated in a simulated cybersecurity test.
They encountered an attack of type: ${attackType}.
Their action was: ${userAction}.
Additional Scenario Details: ${scenarioDetails || 'None provided.'}

Remember: Avoid overly technical jargon. Be professional, encouraging, and clear. Explain the specific 'Red Flags' they likely missed in a way that strengthens their incident preparedness. Emphasize proactive security practices.
`;

  try {
    const aiResponse = await askCyberGuard([
      { role: "user", content: "I just failed a security simulation. Can you explain what I missed and how I can do better next time?" }
    ], context);

    return reply.send({ result: aiResponse });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "CyberGuard AI failed to explain red flags." });
  }
}

async function analyzeRisk(request, reply) {
  if (!hasAiEnabled()) {
    return reply.status(503).send({ error: "CyberGuard AI is not configured." });
  }

  const { analyticsData } = request.body;
  if (!analyticsData) {
    return reply.status(400).send({ error: "analyticsData payload is required." });
  }

  const context = `
You are assisting an IT Security Administrator with Risk Analysis.
Below is a JSON summary of recent platform analytics:
${JSON.stringify(analyticsData, null, 2)}

Remember: Be highly technical and analytical. Answer questions about which departments or vulnerability patterns need the most attention based on this data. Suggest concrete remediation strategies.
`;

  try {
    const aiResponse = await askCyberGuard([
      { role: "user", content: "Based on the provided analytics data, what are our top vulnerability patterns and which areas need the most immediate attention?" }
    ], context);

    return reply.send({ result: aiResponse });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "CyberGuard AI failed to analyze risk." });
  }
}

module.exports = {
  generateAdminTemplates,
  explainRedFlags,
  analyzeRisk
};
