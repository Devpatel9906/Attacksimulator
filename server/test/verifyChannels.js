
require('dotenv').config({ path: '/Users/dev/Downloads/Attack_Simulator-main/attacksimulator/server/.env' });
const { dispatchAttack } = require('../utils/channelSender');

async function testChannels() {
  const employee = {
    displayName: 'Test User',
    email: process.env.SMTP_USER,
    phone: process.env.TWILIO_FROM_PHONE, // Using own phone for test if needed, or a real test number
    telegramId: '5756778465', // Example ID, replace if testing real telegram
    behavioralArchetype: 'rushed_responder'
  };

  const trackingUrl = `${process.env.PUBLIC_URL}/api/sim/click/test-token`;
  const orgName = 'Security Test Lab';

  console.log('--- Starting Channel Verification ---');

  // 1. Email
  console.log('\n[1] Testing Email...');
  const emailResult = await dispatchAttack({
    employee,
    attackType: 'email_phishing',
    trackingUrl,
    orgName,
    channel: 'email'
  });
  console.log('Email Result:', emailResult);

  // 2. SMS
  console.log('\n[2] Testing SMS...');
  const smsResult = await dispatchAttack({
    employee,
    attackType: 'social_engineering',
    trackingUrl,
    orgName,
    channel: 'sms'
  });
  console.log('SMS Result:', smsResult);

  // 3. WhatsApp
  console.log('\n[3] Testing WhatsApp...');
  const waResult = await dispatchAttack({
    employee,
    attackType: 'social_engineering',
    trackingUrl,
    orgName,
    channel: 'whatsapp'
  });
  console.log('WhatsApp Result:', waResult);

  // 4. Voice
  console.log('\n[4] Testing Voice...');
  const voiceResult = await dispatchAttack({
    employee,
    attackType: 'voice_phishing',
    trackingUrl,
    orgName,
    channel: 'voice'
  });
  console.log('Voice Result:', voiceResult);

  // 5. Telegram
  console.log('\n[5] Testing Telegram...');
  const tgResult = await dispatchAttack({
    employee,
    attackType: 'credential_harvesting',
    trackingUrl,
    orgName,
    channel: 'telegram'
  });
  console.log('Telegram Result:', tgResult);

  console.log('\n--- Verification Finished ---');
}

testChannels().catch(console.error);
