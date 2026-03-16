const CHANNEL_MATRIX = {

  email_phishing: ["email"],

  credential_harvesting: [
    "email",
    "telegram"
  ],

  social_engineering: [
    "email",
    "sms",
    "whatsapp"
  ],

  malware_simulation: [
    "email",
    "whatsapp"
  ],

  sim_swap: [
    "sms",
    "voice"
  ],

  voice_phishing: [
    "voice"
  ]

}



function selectDelivery({ attackType, archetype, aggressionLevel }) {

  const channels = CHANNEL_MATRIX[attackType] || ["email"]

  let channel = channels[0]


  if (aggressionLevel >= 3 && channels.includes("sms"))
    channel = "sms"


  if (aggressionLevel >= 4 && channels.includes("whatsapp"))
    channel = "whatsapp"


  if (aggressionLevel >= 5 && channels.includes("voice"))
    channel = "voice"


  let contentType = "text"

  if (attackType === "malware_simulation")
    contentType = "pdf"


  return {
    channel,
    contentType
  }

}



async function buildContent({
  attackType,
  contentType,
  employee,
  orgName,
  managerName,
  trackingUrl
}) {

  if (contentType !== "pdf")
    return null


  const buffer = Buffer.from(`
Fake document for simulation

Employee: ${employee.displayName}
Organization: ${orgName}

Open:
${trackingUrl}
`)


  return {
    buffer,
    filename: "document.pdf"
  }

}



// Channel → default attack type (for manual channel selection from UI)
const CHANNEL_TO_ATTACK_TYPE = {
  email: 'email_phishing',
  sms: 'social_engineering',
  whatsapp: 'social_engineering',
  voice: 'voice_phishing',
  telegram: 'credential_harvesting'
}

module.exports = {
  selectDelivery,
  buildContent,
  CHANNEL_MATRIX,
  CHANNEL_TO_ATTACK_TYPE
}