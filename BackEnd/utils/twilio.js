const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio Client initialized successfully.');
  } catch (e) {
    console.warn('⚠️ Twilio initialization warning:', e.message);
  }
}

// Phone number formatters
function formatE164Number(phone) {
  let clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('0')) {
    clean = '+94' + clean.substring(1);
  } else if (!clean.startsWith('+')) {
    clean = '+94' + clean;
  }
  return clean;
}

function formatWhatsAppNumber(phone) {
  return `whatsapp:${formatE164Number(phone)}`;
}

module.exports = {
  twilioClient,
  formatE164Number,
  formatWhatsAppNumber
};
