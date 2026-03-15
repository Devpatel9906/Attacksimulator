const { GoogleGenAI } = require('@google/genai');

let geminiClient = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'leave_empty_for_now') {
  geminiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
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
 * Sends a standard structured query to CyberGuard AI (Gemini)
 * @param {Array} messages - Array of message objects {role: 'user', content: '...'}
 * @param {String} context - Additional context to append to the system prompt (optional)
 * @returns {String} The AI's response text
 */
async function askCyberGuard(messages, context = '') {
  if (!geminiClient) {
    throw new Error('Gemini API key is not configured.');
  }

  const systemPrompt = context 
    ? `${CYBERGUARD_SYSTEM_PROMPT}\n\nAdditional Context for this request:\n${context}`
    : CYBERGUARD_SYSTEM_PROMPT;

  // Convert messages roughly into Gemini format: just a prompt string since we are doing simple 1-turn requests here.
  // The inputs we get are like: [{ role: "user", content: "Please generate..." }]
  const userMessage = messages[messages.length - 1].content;
  
  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error('CyberGuard AI Error:', error);
    throw new Error('Failed to generate response from CyberGuard AI.');
  }
}

module.exports = {
  askCyberGuard,
  hasAiEnabled: () => !!geminiClient
};
