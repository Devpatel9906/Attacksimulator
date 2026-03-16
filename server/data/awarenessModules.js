const AwarenessModule = require('../models/AwarenessModule')

const MODULES = [
  {
    attackType: 'email_phishing',
    difficulty: 'level_1',
    title: 'Recognizing Phishing Emails',
    description: 'Learn to identify the red flags in phishing emails before you click.',
    simulationType: 'hacker_dashboard',
    estimatedMinutes: 5,
    content: {
      redFlags: ['Urgency and fear language', 'Generic greeting', 'Mismatched sender domain', 'Suspicious link URL', 'Requests for credentials'],
      realWorldExample: 'FBI IC3 reports $2.7B lost to phishing in 2023'
    },
    quiz: [
      { question: 'What is the most common red flag in a phishing email?', options: ['A professional logo', 'Urgency and fear language', 'A plain text format', 'A long email thread'], correctIndex: 1, explanation: 'Phishing emails use urgency to bypass rational thinking.' },
      { question: 'You receive an email from "it-support@acmec0rp.com". What should you do?', options: ['Click the link immediately', 'Reply with your password', 'Report it to security', 'Forward it to colleagues'], correctIndex: 2, explanation: 'The domain is misspelled — acmec0rp vs acmecorp. Always check sender domain carefully.' },
      { question: 'Which action is safest when unsure about an email?', options: ['Click to verify', 'Call the sender on a known number', 'Reply asking for clarification', 'Ignore it forever'], correctIndex: 1, explanation: 'Always verify through a separate trusted channel — phone or in person.' }
    ]
  },
  {
    attackType: 'credential_harvesting',
    difficulty: 'level_1',
    title: 'Protecting Your Credentials',
    description: 'Understand how attackers steal passwords and how to stop them.',
    simulationType: 'identity_tree',
    estimatedMinutes: 5,
    content: {
      redFlags: ['Fake login page URL', 'Missing HTTPS', 'Slight domain misspelling', 'Unexpected password reset request'],
      realWorldExample: 'Average credential theft breach costs $4.45M (IBM 2023)'
    },
    quiz: [
      { question: 'You land on a login page after clicking an email link. What do you check first?', options: ['The page design', 'The URL in the address bar', 'Whether the form works', 'The email sender name'], correctIndex: 1, explanation: 'Always verify the URL before entering credentials. Fake pages can look identical.' },
      { question: 'What is credential stuffing?', options: ['Creating strong passwords', 'Using leaked passwords from one site on another', 'Storing passwords in a document', 'Changing passwords frequently'], correctIndex: 1, explanation: 'Attackers use leaked credentials from data breaches to try logging into other services.' },
      { question: 'What is the best protection against credential harvesting?', options: ['Reusing strong passwords', 'Using a password manager and unique passwords', 'Writing passwords down securely', 'Changing passwords monthly'], correctIndex: 1, explanation: 'Unique passwords per site prevent credential stuffing even if one site is breached.' }
    ]
  },
  {
    attackType: 'malware_simulation',
    difficulty: 'level_1',
    title: 'Fileless Malware and Safe Downloads',
    description: 'Learn how modern malware hides from antivirus and what you can do.',
    simulationType: 'ghost_in_machine',
    estimatedMinutes: 5,
    content: {
      redFlags: ['Unexpected file attachments', 'Executable files in email', 'USB drives from unknown sources', 'Software from unofficial sources'],
      realWorldExample: 'Fileless malware attacks increased 900% in 2023 (WatchGuard)'
    },
    quiz: [
      { question: 'Fileless malware is dangerous because:', options: ['It destroys files immediately', 'It leaves no file on disk for antivirus to scan', 'It only affects Windows XP', 'It requires physical access'], correctIndex: 1, explanation: 'Fileless malware lives in RAM and uses legitimate tools like PowerShell — antivirus cannot detect it.' },
      { question: 'You receive an email with an attachment named "Invoice_Q4.exe". What do you do?', options: ['Open it — it is probably real', 'Report it to IT security immediately', 'Save it and open later', 'Forward to your manager'], correctIndex: 1, explanation: 'Executable files (.exe) in emails are almost always malicious. Never open them.' },
      { question: 'Which is the safest source to download software?', options: ['Any website that offers it free', 'A colleague USB drive', 'Official vendor website or company IT portal', 'A search engine top result'], correctIndex: 2, explanation: 'Only download software from official sources. SEO poisoning places malware at the top of search results.' }
    ]
  },
  {
    attackType: 'sim_swap',
    difficulty: 'level_1',
    title: 'SIM Swapping and the 2FA Paradox',
    description: 'Discover how attackers bypass two-factor authentication through your phone number.',
    simulationType: '2fa_paradox',
    estimatedMinutes: 5,
    content: {
      storyboard: ['Digital Stalking', 'Identity Theft at carrier', '2FA Paradox', 'Clean Sweep'],
      shields: ['Enable SIM PIN', 'Use app-based authenticator', 'Monitor for No Service alert'],
      realWorldExample: 'Twitter CEO Jack Dorsey had his account hijacked via SIM swap in 2019'
    },
    quiz: [
      { question: 'What is a SIM swap attack?', options: ['Hacking a phone physically', 'Tricking a carrier into transferring your number to attacker SIM', 'Installing malware on a phone', 'Intercepting WiFi traffic'], correctIndex: 1, explanation: 'Attacker impersonates you at the carrier and gets a new SIM with your number, taking over all SMS-based 2FA.' },
      { question: 'Your phone suddenly shows No Service for 15 minutes. What should you do?', options: ['Wait for signal to return', 'Immediately call your bank and carrier from another phone', 'Restart your phone', 'Check your settings'], correctIndex: 1, explanation: 'Sudden loss of service can indicate SIM swap in progress. Act immediately — every minute counts.' },
      { question: 'Which 2FA method is most resistant to SIM swap?', options: ['SMS OTP', 'Email OTP', 'App-based authenticator like Google Authenticator', 'Security questions'], correctIndex: 2, explanation: 'App-based authenticators generate codes locally on your device — they cannot be intercepted via SIM swap.' }
    ]
  },
  {
    attackType: 'social_engineering',
    difficulty: 'level_1',
    title: 'Social Engineering and Pretexting',
    description: 'Learn how attackers use psychological manipulation instead of technical hacks.',
    simulationType: 'infected_community',
    estimatedMinutes: 5,
    content: {
      redFlags: ['Unusual urgency from authority figure', 'Request to bypass normal procedure', 'Pressure to act before verifying', 'Flattery followed by a request'],
      realWorldExample: 'Ubiquiti lost $46.7M to BEC social engineering in 2015'
    },
    quiz: [
      { question: 'Social engineering attacks rely primarily on:', options: ['Technical exploits', 'Human psychology and trust', 'Network vulnerabilities', 'Outdated software'], correctIndex: 1, explanation: 'Social engineering bypasses technical security by manipulating human behavior — trust, fear, and authority.' },
      { question: 'Your CEO emails you asking to wire $50,000 urgently and keep it secret. You should:', options: ['Wire it immediately — CEO is urgent', 'Verify by calling the CEO directly on a known number', 'Reply asking for more details', 'Forward to finance immediately'], correctIndex: 1, explanation: 'CEO fraud is a common BEC attack. Always verify wire transfers through a separate channel regardless of email urgency.' },
      { question: 'What is pretexting?', options: ['Adding a prefix to an email', 'Creating a fabricated scenario to manipulate someone', 'Testing an email before sending', 'A type of spam filter'], correctIndex: 1, explanation: 'Pretexting involves inventing a believable backstory to gain trust and extract information or action.' }
    ]
  }
]

async function seedAwarenessModules() {
  for (const moduleData of MODULES) {
    const existing = await AwarenessModule.findOne({ attackType: moduleData.attackType, difficulty: moduleData.difficulty })
    if (!existing) {
      await AwarenessModule.create(moduleData)
      console.log(`Seeded module: ${moduleData.title}`)
    }
  }
  console.log('Awareness modules seeded')
}

module.exports = { seedAwarenessModules }