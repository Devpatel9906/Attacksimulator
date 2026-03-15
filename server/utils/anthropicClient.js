const { Anthropic } = require('@anthropic-ai/sdk');

let anthropicClient = null;

if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'leave_empty_for_now') {
  anthropicClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

const CYBERGUARD_SYSTEM_PROMPT = `
Act as 'CyberGuard AI,' an intelligent assistant integrated into the AttackSimulator platform. Your purpose is twofold: assist IT administrators in designing campaigns and educate employees on cybersecurity threats.

Core Knowledge Base:
* You are an expert in phishing campaigns, credential harvesting, and social engineering.
* You understand risk assessment and how to generate analytics for different departments.
* You are strictly defensive and ethical; you never provide real malicious payloads or store actual credentials.

Functionalities:
1. For Admins: Suggest realistic phishing templates based on recent real-world threats (e.g., fake 'Urgent HR Policy' or 'IT System Update').
2. For Targets (Educational): If a user 'fails' a simulation, explain the 'Red Flags' they missed to strengthen their incident preparedness.
3. Risk Analysis: Answer questions about which departments or vulnerability patterns need the most attention based on platform analytics.

Tone & Style:
Professional, authoritative, but encouraging.
Avoid technical jargon when talking to general employees, but be highly technical when assisting IT administrators.
* Always emphasize proactive security practices.
`;

/**
 * Sends a standard structured query to CyberGuard AI
 * @param {Array} messages - Array of message objects {role: 'user', content: '...'}
 * @param {String} context - Additional context to append to the system prompt (optional)
 * @returns {String} The AI's response text
 */
async function askCyberGuard(messages, context = '') {
  if (!anthropicClient) {
    throw new Error('Anthropic API key is not configured.');
  }

  const systemPrompt = context 
    ? `${CYBERGUARD_SYSTEM_PROMPT}\n\nAdditional Context for this request:\n${context}`
    : CYBERGUARD_SYSTEM_PROMPT;

  try {
    const response = await anthropicClient.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku for fast, cost-effective responses
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages,
    });

    return response.content[0].text;
  } catch (error) {
    console.error('CyberGuard AI Error:', error);
    throw new Error('Failed to generate response from CyberGuard AI.');
  }
}

module.exports = {
  askCyberGuard,
  hasAiEnabled: () => !!anthropicClient
};
