const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.warn('TWILIO_PHONE_NUMBER not set. SMS not sent.');
      return { success: false, message: 'SMS service not configured' };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log(`SMS sent to ${to}: SID=${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Twilio error:', error);
    return { success: false, error: error.message };
  }
};

const sendBulkSMS = async (recipients, message) => {
  const results = [];
  for (const recipient of recipients) {
    const result = await sendSMS(recipient, message);
    results.push({ recipient, ...result });
  }
  return results;
};

module.exports = {
  sendSMS,
  sendBulkSMS
};
